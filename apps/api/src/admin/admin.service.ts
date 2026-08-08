import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvisionTenantDto } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOrganizations() {
    return this.prisma.client.organization.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async provisionTenant(dto: ProvisionTenantDto) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: dto.ownerEmail },
    });

    if (existingUser) {
      throw new ConflictException('Owner email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.ownerPassword, 10);
    const slug = dto.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create Owner User
      const user = await tx.user.create({
        data: {
          email: dto.ownerEmail,
          passwordHash: hashedPassword,
          firstName: dto.ownerFirstName,
          lastName: dto.ownerLastName,
        },
      });

      // 2. Create Organization
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: slug,
        },
      });

      // 3. Link User as OWNER
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'OWNER',
        },
      });

      return { success: true, orgId: org.id };
    });
  }

  async getUsers() {
    return this.prisma.client.user.findMany({
      include: {
        memberships: {
          include: { organization: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogs() {
    return this.prisma.client.auditLog.findMany({
      include: { user: true, organization: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getSettings() {
    return {
      maintenanceMode: false,
      stripePublicKey: 'pk_test_shopflow_placeholder',
      supportEmail: 'support@shopflow.app',
    };
  }

  async updateSettings(dto: any) {
    return { success: true, settings: dto };
  }
}
