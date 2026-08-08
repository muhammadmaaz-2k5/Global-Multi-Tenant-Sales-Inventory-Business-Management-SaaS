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

  async importCsv(orgId: string, file: any) {
    const csvData = file.buffer.toString('utf-8');
    const lines = csvData.split('\n').map((l: string) => l.trim()).filter(Boolean);
    if (lines.length < 2) return []; // Only header or empty

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const priceIdx = headers.indexOf('price');
    const skuIdx = headers.indexOf('sku');

    if (nameIdx === -1) throw new Error('CSV must contain a "Name" column');

    const productsToCreate: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const name = cols[nameIdx];
      const basePrice = priceIdx !== -1 ? parseFloat(cols[priceIdx]) || 0 : 0;
      const sku = skuIdx !== -1 ? cols[skuIdx] : null;

      if (!name) continue;

      productsToCreate.push({
        organizationId: orgId,
        name,
        basePrice,
        sku,
      });
    }

    if (productsToCreate.length === 0) return [];

    await this.prisma.client.product.createMany({
      data: productsToCreate,
      skipDuplicates: true,
    });

    // Fetch the newly created ones
    const newProductNames = productsToCreate.map(p => p.name);
    return this.prisma.client.product.findMany({
      where: {
        organizationId: orgId,
        name: { in: newProductNames }
      },
      include: {
        variants: true,
        category: true,
        brand: true,
      }
    });
  }
}
