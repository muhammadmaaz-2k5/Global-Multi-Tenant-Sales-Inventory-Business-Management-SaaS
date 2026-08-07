import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateSupplierDto) {
    return this.prisma.client.supplier.create({
      data: { ...dto, organizationId: orgId },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.supplier.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const supplier = await this.prisma.client.supplier.findUnique({
      where: { id, organizationId: orgId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(orgId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(orgId, id);
    return this.prisma.client.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.client.supplier.delete({
      where: { id },
    });
  }
}
