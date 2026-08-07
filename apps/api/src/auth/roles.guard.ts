import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles defined, meaning it's accessible
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { sub: string } }>();
    const user = request.user;
    const orgId = request.params.orgId as string;

    if (!user || !orgId) {
      throw new ForbiddenException('Missing user or organization context');
    }

    // Lookup the member's role in this organization
    const member = await this.prisma.client.organizationMember.findFirst({
      where: {
        userId: user.sub,
        organizationId: orgId,
      },
    });

    if (!member) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    // Check if member role is in the required roles
    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        `Access denied. Requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
