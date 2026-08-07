import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/orders.dto';
import { OrderStatus, MovementType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(orgId: string, userId: string, dto: CheckoutDto) {
    // 1. Calculate totals
    const subtotal = dto.items.reduce(
      (acc, item) =>
        acc + item.unitPrice * item.quantity - (item.discount || 0),
      0,
    );
    const tax = subtotal * 0.08; // Simple hardcoded 8% tax for now
    const total = subtotal + tax;

    // 2. Perform everything in a single transaction
    return this.prisma.client.$transaction(async (tx) => {
      // 3. Create the order
      const order = await tx.order.create({
        data: {
          organizationId: orgId,
          userId,
          locationId: dto.locationId,
          paymentMethod: dto.paymentMethod,
          subtotal,
          tax,
          total,
          status: OrderStatus.COMPLETED,
          items: {
            create: dto.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 4. Atomically decrement inventory and create movements
      for (const item of dto.items) {
        // Upsert the inventory level: if it doesn't exist, we assume they had 0 and now have negative (allow negative stock for retail flex)
        const currentLevel = await tx.inventoryLevel.findUnique({
          where: {
            locationId_variantId: {
              locationId: dto.locationId,
              variantId: item.variantId,
            },
          },
        });

        const currentQty = currentLevel ? currentLevel.quantity : 0;
        const newQty = currentQty - item.quantity;

        await tx.inventoryLevel.upsert({
          where: {
            locationId_variantId: {
              locationId: dto.locationId,
              variantId: item.variantId,
            },
          },
          create: {
            locationId: dto.locationId,
            variantId: item.variantId,
            quantity: newQty,
          },
          update: {
            quantity: newQty,
          },
        });

        // Create the movement log
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: MovementType.SALE,
            quantity: -item.quantity,
            fromLocationId: dto.locationId,
            userId,
            reason: `Order ${order.id}`,
          },
        });
      }

      // 5. Delete suspended cart if it exists
      if (dto.posCartId) {
        await tx.posCart.deleteMany({
          where: { id: dto.posCartId, organizationId: orgId },
        });
      }

      return order;
    });
  }

  async refund(orgId: string, orderId: string, userId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, organizationId: orgId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Order not found');
      if (order.status === OrderStatus.REFUNDED)
        throw new BadRequestException('Order already refunded');

      // 1. Mark as refunded
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED },
      });

      // 2. Return items to inventory
      for (const item of order.items) {
        const currentLevel = await tx.inventoryLevel.findUnique({
          where: {
            locationId_variantId: {
              locationId: order.locationId,
              variantId: item.variantId,
            },
          },
        });

        const newQty =
          (currentLevel ? currentLevel.quantity : 0) + item.quantity;

        await tx.inventoryLevel.upsert({
          where: {
            locationId_variantId: {
              locationId: order.locationId,
              variantId: item.variantId,
            },
          },
          create: {
            locationId: order.locationId,
            variantId: item.variantId,
            quantity: newQty,
          },
          update: {
            quantity: newQty,
          },
        });

        // Movement log
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: MovementType.RETURN,
            quantity: item.quantity,
            toLocationId: order.locationId,
            userId,
            reason: `Refund Order ${order.id}`,
          },
        });
      }

      return updatedOrder;
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.order.findMany({
      where: { organizationId: orgId },
      include: {
        location: true,
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id, organizationId: orgId },
      include: {
        location: true,
        user: { select: { firstName: true, lastName: true } },
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        organization: true, // For receipt printing
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
