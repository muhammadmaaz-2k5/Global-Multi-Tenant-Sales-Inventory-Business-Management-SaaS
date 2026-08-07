import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/purchase-orders.dto';
import { PurchaseOrderStatus, MovementType } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreatePurchaseOrderDto) {
    const totalAmount = dto.items.reduce(
      (acc, item) => acc + item.unitCost * item.quantity,
      0,
    );

    return this.prisma.client.purchaseOrder.create({
      data: {
        organizationId: orgId,
        supplierId: dto.supplierId,
        locationId: dto.locationId,
        totalAmount,
        status: PurchaseOrderStatus.ORDERED,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.purchaseOrder.findMany({
      where: { organizationId: orgId },
      include: {
        supplier: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const po = await this.prisma.client.purchaseOrder.findUnique({
      where: { id, organizationId: orgId },
      include: {
        supplier: true,
        location: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async receive(orgId: string, id: string, userId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id, organizationId: orgId },
        include: { items: true },
      });

      if (!po) throw new NotFoundException('Purchase order not found');
      if (po.status === PurchaseOrderStatus.RECEIVED) {
        throw new BadRequestException('Purchase order already received');
      }

      // Mark as received
      const updatedPo = await tx.purchaseOrder.update({
        where: { id },
        data: { status: PurchaseOrderStatus.RECEIVED },
      });

      // Increment inventory
      for (const item of po.items) {
        const currentLevel = await tx.inventoryLevel.findUnique({
          where: {
            locationId_variantId: {
              locationId: po.locationId,
              variantId: item.variantId,
            },
          },
        });

        const newQty =
          (currentLevel ? currentLevel.quantity : 0) + item.quantity;

        await tx.inventoryLevel.upsert({
          where: {
            locationId_variantId: {
              locationId: po.locationId,
              variantId: item.variantId,
            },
          },
          create: {
            locationId: po.locationId,
            variantId: item.variantId,
            quantity: newQty,
          },
          update: {
            quantity: newQty,
          },
        });

        // Movement Log
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: MovementType.RECEIVE,
            quantity: item.quantity,
            toLocationId: po.locationId,
            userId,
            reason: `PO ${po.id} Received`,
          },
        });
      }

      return updatedPo;
    });
  }
}
