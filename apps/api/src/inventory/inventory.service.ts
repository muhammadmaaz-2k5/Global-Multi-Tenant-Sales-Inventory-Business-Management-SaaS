import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto, TransferInventoryDto } from './dto/inventory.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getLevels(orgId: string, locationId?: string) {
    // Basic verification that the location belongs to the org if provided
    if (locationId) {
      const location = await this.prisma.client.location.findFirst({
        where: { id: locationId, organizationId: orgId },
      });
      if (!location) throw new NotFoundException('Location not found');
    }

    return this.prisma.client.inventoryLevel.findMany({
      where: {
        location: {
          organizationId: orgId,
          ...(locationId ? { id: locationId } : {}),
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        location: true,
      },
    });
  }

  async adjust(orgId: string, userId: string, dto: AdjustInventoryDto) {
    // Verify location belongs to organization
    const location = await this.prisma.client.location.findFirst({
      where: { id: dto.locationId, organizationId: orgId },
    });
    if (!location) throw new NotFoundException('Location not found');

    // Verify variant belongs to a product in the organization
    const variant = await this.prisma.client.productVariant.findFirst({
      where: {
        id: dto.variantId,
        product: { organizationId: orgId },
      },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.client.$transaction(async (tx) => {
      // Upsert Inventory Level
      const currentLevel = await tx.inventoryLevel.findUnique({
        where: {
          locationId_variantId: {
            locationId: dto.locationId,
            variantId: dto.variantId,
          },
        },
      });

      const currentQuantity = currentLevel ? currentLevel.quantity : 0;
      const newQuantity = currentQuantity + dto.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException('Insufficient inventory to deduct');
      }

      await tx.inventoryLevel.upsert({
        where: {
          locationId_variantId: {
            locationId: dto.locationId,
            variantId: dto.variantId,
          },
        },
        update: { quantity: newQuantity },
        create: {
          locationId: dto.locationId,
          variantId: dto.variantId,
          quantity: newQuantity,
        },
      });

      // Record movement
      return tx.inventoryMovement.create({
        data: {
          variantId: dto.variantId,
          toLocationId: dto.quantity > 0 ? dto.locationId : null,
          fromLocationId: dto.quantity < 0 ? dto.locationId : null,
          quantity: dto.quantity,
          type: MovementType.ADJUST,
          reason: dto.reason,
          userId,
        },
      });
    });
  }

  async transfer(orgId: string, userId: string, dto: TransferInventoryDto) {
    if (dto.quantity <= 0)
      throw new BadRequestException('Transfer quantity must be positive');
    if (dto.fromLocationId === dto.toLocationId)
      throw new BadRequestException(
        'Source and destination cannot be the same',
      );

    // Verify locations belong to organization
    const fromLoc = await this.prisma.client.location.findFirst({
      where: { id: dto.fromLocationId, organizationId: orgId },
    });
    const toLoc = await this.prisma.client.location.findFirst({
      where: { id: dto.toLocationId, organizationId: orgId },
    });

    if (!fromLoc || !toLoc) throw new NotFoundException('Location not found');

    // Verify variant
    const variant = await this.prisma.client.productVariant.findFirst({
      where: { id: dto.variantId, product: { organizationId: orgId } },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Check source level
      const sourceLevel = await tx.inventoryLevel.findUnique({
        where: {
          locationId_variantId: {
            locationId: dto.fromLocationId,
            variantId: dto.variantId,
          },
        },
      });

      if (!sourceLevel || sourceLevel.quantity < dto.quantity) {
        throw new BadRequestException(
          'Insufficient inventory at source location',
        );
      }

      // 2. Deduct from source
      await tx.inventoryLevel.update({
        where: { id: sourceLevel.id },
        data: { quantity: { decrement: dto.quantity } },
      });

      // 3. Add to destination
      await tx.inventoryLevel.upsert({
        where: {
          locationId_variantId: {
            locationId: dto.toLocationId,
            variantId: dto.variantId,
          },
        },
        update: { quantity: { increment: dto.quantity } },
        create: {
          locationId: dto.toLocationId,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });

      // 4. Record movement
      return tx.inventoryMovement.create({
        data: {
          variantId: dto.variantId,
          fromLocationId: dto.fromLocationId,
          toLocationId: dto.toLocationId,
          quantity: dto.quantity,
          type: MovementType.TRANSFER,
          reason: dto.reason,
          userId,
        },
      });
    });
  }
}
