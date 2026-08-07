import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async getOrganizationsForUser(userId: string) {
    const memberships = await this.prisma.client.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
    });
    return memberships.map((m) => ({
      ...m.organization,
      myRole: m.role,
    }));
  }

  async getOrganizationDetails(orgId: string, userId: string) {
    const membership = await this.prisma.client.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization.',
      );
    }

    const org = await this.prisma.client.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return org;
  }

  async updateSettings(
    orgId: string,
    userId: string,
    data: { defaultTaxRate?: number },
  ) {
    // Only owners should ideally do this, but we'll let OrgMemberGuard + RolesGuard handle it in the controller if needed.
    // For now, just basic membership check.
    const membership = await this.prisma.client.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only owners can update organization settings.',
      );
    }

    return this.prisma.client.organization.update({
      where: { id: orgId },
      data: {
        ...(data.defaultTaxRate !== undefined && {
          defaultTaxRate: data.defaultTaxRate,
        }),
      },
    });
  }
}
