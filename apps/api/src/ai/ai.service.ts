import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  query(orgId: string, question: string) {
    // In a real implementation, this would connect to an LLM provider (OpenAI, Gemini, etc.)
    // For now, we simulate an intelligent response by parsing keywords
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('top selling') || lowerQ.includes('best product')) {
      return {
        answer:
          "Based on recent sales data, your top selling product is currently 'Wireless Headphones' with over 45 units sold this week.",
        type: 'INSIGHT',
      };
    }

    if (lowerQ.includes('low stock') || lowerQ.includes('running out')) {
      return {
        answer:
          "You currently have 2 items running low on stock. Specifically, 'Ergonomic Chair' at Downtown Store is down to 4 units. I recommend reordering soon.",
        type: 'ALERT',
      };
    }

    if (lowerQ.includes('profit') || lowerQ.includes('margin')) {
      return {
        answer:
          'Your overall profit margin across the business is sitting at a healthy 32%. Your highest margin category is Electronics.',
        type: 'FINANCIAL',
      };
    }

    return {
      answer:
        "I'm your ShopFlow AI Assistant. I can analyze your sales, inventory, and financial data. Try asking me about your top selling products, low stock items, or profit margins!",
      type: 'GENERAL',
    };
  }
}
