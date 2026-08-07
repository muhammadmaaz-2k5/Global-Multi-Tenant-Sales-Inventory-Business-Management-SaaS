import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    return this.prisma.client.product.create({
      data: {
        ...productData,
        organizationId: orgId,
        variants: {
          create: variants || [],
        },
      },
      include: {
        variants: true,
        category: true,
        brand: true,
      },
    });
  }

  async findAll(orgId: string, q?: string) {
    const whereClause: Prisma.ProductWhereInput = { organizationId: orgId };

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q, mode: 'insensitive' } },
        {
          variants: {
            some: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
                { barcode: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    return this.prisma.client.product.findMany({
      where: whereClause,
      include: {
        variants: true,
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const product = await this.prisma.client.product.findUnique({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        variants: true,
        category: true,
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(orgId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(orgId, id); // Ensure it exists and belongs to org

    return this.prisma.client.product.update({
      where: { id },
      data: dto,
      include: {
        variants: true,
        category: true,
        brand: true,
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id); // Ensure it exists and belongs to org

    return this.prisma.client.product.delete({
      where: { id },
    });
  }
}
