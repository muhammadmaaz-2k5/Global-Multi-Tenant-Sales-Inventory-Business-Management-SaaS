import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    orgId: string,
    userId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Prisma.InputJsonValue,
  ) {
    return this.prisma.client.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action,
        entityType,
        entityId,
        details: details || {},
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.auditLog.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 recent logs for now
    });
  }
}
