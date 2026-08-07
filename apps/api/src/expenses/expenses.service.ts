import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateExpenseDto) {
    return this.prisma.client.expense.create({
      data: {
        ...dto,
        organizationId: orgId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.expense.findMany({
      where: { organizationId: orgId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const expense = await this.prisma.client.expense.findUnique({
      where: { id, organizationId: orgId },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(orgId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(orgId, id);
    return this.prisma.client.expense.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.client.expense.delete({
      where: { id },
    });
  }
}
