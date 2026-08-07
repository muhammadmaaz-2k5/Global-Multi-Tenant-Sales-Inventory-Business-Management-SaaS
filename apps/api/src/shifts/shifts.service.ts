import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async clockIn(orgId: string, userId: string) {
    // Check if there is an active shift
    const activeShift = await this.prisma.client.shift.findFirst({
      where: { organizationId: orgId, userId, clockOut: null },
    });

    if (activeShift) {
      throw new BadRequestException('Already clocked in');
    }

    return this.prisma.client.shift.create({
      data: {
        organizationId: orgId,
        userId,
        clockIn: new Date(),
      },
    });
  }

  async clockOut(orgId: string, userId: string) {
    const activeShift = await this.prisma.client.shift.findFirst({
      where: { organizationId: orgId, userId, clockOut: null },
      orderBy: { clockIn: 'desc' },
    });

    if (!activeShift) {
      throw new BadRequestException('Not clocked in');
    }

    return this.prisma.client.shift.update({
      where: { id: activeShift.id },
      data: { clockOut: new Date() },
    });
  }

  async getActiveShift(orgId: string, userId: string) {
    return this.prisma.client.shift.findFirst({
      where: { organizationId: orgId, userId, clockOut: null },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.shift.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { clockIn: 'desc' },
    });
  }
}
