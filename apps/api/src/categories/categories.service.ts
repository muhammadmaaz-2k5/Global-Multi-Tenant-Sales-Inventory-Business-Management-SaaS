import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateCategoryDto) {
    return this.prisma.client.category.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.category.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const category = await this.prisma.client.category.findUnique({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(orgId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(orgId, id); // Ensure it exists and belongs to org

    return this.prisma.client.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id); // Ensure it exists and belongs to org

    return this.prisma.client.category.delete({
      where: { id },
    });
  }
}
