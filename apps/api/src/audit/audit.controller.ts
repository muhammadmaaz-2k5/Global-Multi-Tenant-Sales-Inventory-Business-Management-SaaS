import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, OrgMemberGuard, RolesGuard)
@Controller('organizations/:orgId/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(Role.OWNER) // Only owners can see audit logs
  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.auditService.findAll(orgId);
  }
}
