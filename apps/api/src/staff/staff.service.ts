import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRoleDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.client.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async updateRole(orgId: string, memberId: string, dto: UpdateRoleDto) {
    const member = await this.prisma.client.organizationMember.findUnique({
      where: { id: memberId, organizationId: orgId },
    });

    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.client.organizationMember.update({
      where: { id: memberId },
      data: { role: dto.role },
    });
  }
}
