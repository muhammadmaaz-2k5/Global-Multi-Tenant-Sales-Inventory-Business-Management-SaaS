import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateRoleDto } from './dto/staff.dto';

@UseGuards(JwtAuthGuard, OrgMemberGuard, RolesGuard)
@Controller('organizations/:orgId/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.staffService.findAll(orgId);
  }

  @Roles(Role.OWNER) // Only owners can change roles
  @Patch(':id/role')
  updateRole(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.staffService.updateRole(orgId, id, dto);
  }
}
