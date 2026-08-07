import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    orgId: string,
    userId: string,
    message: string,
    type: string,
  ) {
    return this.prisma.client.notification.create({
      data: {
        organizationId: orgId,
        userId,
        message,
        type,
      },
    });
  }

  async getUnread(orgId: string, userId: string) {
    return this.prisma.client.notification.findMany({
      where: { organizationId: orgId, userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(orgId: string, userId: string, notificationId: string) {
    return this.prisma.client.notification.update({
      where: { id: notificationId, organizationId: orgId, userId },
      data: { isRead: true },
    });
  }
}
