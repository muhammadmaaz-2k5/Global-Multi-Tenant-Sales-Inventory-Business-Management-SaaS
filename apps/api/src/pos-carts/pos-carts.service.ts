import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePosCartDto } from './dto/pos-carts.dto';
import { PosCartStatus } from '@prisma/client';

@Injectable()
export class PosCartsService {
  constructor(private prisma: PrismaService) {}

  async createOrSuspend(orgId: string, userId: string, dto: CreatePosCartDto) {
    return this.prisma.client.posCart.create({
      data: {
        organizationId: orgId,
        userId: userId,
        status: PosCartStatus.SUSPENDED,
        name: dto.name,
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
  }

  async findSuspended(orgId: string) {
    return this.prisma.client.posCart.findMany({
      where: {
        organizationId: orgId,
        status: PosCartStatus.SUSPENDED,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const cart = await this.prisma.client.posCart.findUnique({
      where: { id, organizationId: orgId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.client.posCart.delete({
      where: { id },
    });
  }
}
