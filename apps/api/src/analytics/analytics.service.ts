import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(orgId: string) {
    // 1. Calculate Gross Sales (Revenue)
    const orders = await this.prisma.client.order.findMany({
      where: { organizationId: orgId, status: 'COMPLETED' },
      include: { items: { include: { variant: true } } },
    });

    let grossSales = 0;
    let cogs = 0;

    for (const order of orders) {
      grossSales += order.subtotal; // Pre-tax revenue
      for (const item of order.items) {
        cogs += (item.variant.costPrice || 0) * item.quantity;
      }
    }

    // 2. Calculate Total Expenses
    const expenses = await this.prisma.client.expense.findMany({
      where: { organizationId: orgId },
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 3. Net Profit
    const netProfit = grossSales - cogs - totalExpenses;

    return {
      grossSales,
      cogs,
      totalExpenses,
      netProfit,
    };
  }
}
