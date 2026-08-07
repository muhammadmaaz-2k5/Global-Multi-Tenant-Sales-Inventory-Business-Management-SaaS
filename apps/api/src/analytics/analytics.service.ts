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

    // 4. Top Selling Products
    const variantSales = new Map<string, { quantity: number; name: string }>();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = variantSales.get(item.variantId) || {
          quantity: 0,
          name: item.variant.name,
        };
        variantSales.set(item.variantId, {
          quantity: existing.quantity + item.quantity,
          name: item.variant.name,
        });
      }
    }

    const topProducts = Array.from(variantSales.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        quantitySold: data.quantity,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5); // Top 5

    // 5. Low Stock Alerts
    const lowStockAlerts = await this.prisma.client.inventoryLevel.findMany({
      where: {
        variant: { product: { organizationId: orgId } },
        quantity: { lt: 10 },
      },
      include: {
        variant: true,
        location: true,
      },
      take: 10,
    });

    return {
      grossSales,
      cogs,
      totalExpenses,
      netProfit,
      topProducts,
      lowStockAlerts: lowStockAlerts.map((l) => ({
        variantName: l.variant.name,
        locationName: l.location.name,
        quantity: l.quantity,
      })),
    };
  }
}
