import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateCustomerDto) {
    return this.prisma.client.customer.create({
      data: { ...dto, organizationId: orgId },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id, organizationId: orgId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(orgId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(orgId, id);
    return this.prisma.client.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.client.customer.delete({
      where: { id },
    });
  }
}
