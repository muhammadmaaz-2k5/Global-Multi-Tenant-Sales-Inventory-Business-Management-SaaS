import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brands.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateBrandDto) {
    return this.prisma.client.brand.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.brand.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const brand = await this.prisma.client.brand.findUnique({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(orgId: string, id: string, dto: UpdateBrandDto) {
    await this.findOne(orgId, id); // Ensure it exists and belongs to org

    return this.prisma.client.brand.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id); // Ensure it exists and belongs to org

    return this.prisma.client.brand.delete({
      where: { id },
    });
  }
}
