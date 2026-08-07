import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { user?: { sub: string }; orgMembership?: unknown }
      >();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated.');
    }

    // Try to extract orgId from params, query, or body
    const body = request.body as Record<string, unknown> | undefined;
    const rawOrgId =
      request.params['orgId'] ||
      request.query['orgId'] ||
      body?.['organizationId'];

    // Ensure it's a primitive string
    const orgId = typeof rawOrgId === 'string' ? rawOrgId : String(rawOrgId);

    if (!orgId) {
      throw new ForbiddenException(
        'Organization ID is missing in the request.',
      );
    }

    const membership = await this.prisma.client.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: String(user.sub),
          organizationId: String(orgId),
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization.',
      );
    }

    // Attach membership to request for downstream use (e.g. role checking)
    request.orgMembership = membership;

    return true;
  }
}
