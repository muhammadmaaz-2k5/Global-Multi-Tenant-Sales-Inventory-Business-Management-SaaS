import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, OrgMemberGuard, RolesGuard)
@Controller('organizations/:orgId/shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('clock-in')
  clockIn(
    @Param('orgId') orgId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.shiftsService.clockIn(orgId, req.user.sub);
  }

  @Post('clock-out')
  clockOut(
    @Param('orgId') orgId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.shiftsService.clockOut(orgId, req.user.sub);
  }

  @Get('active')
  getActiveShift(
    @Param('orgId') orgId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.shiftsService.getActiveShift(orgId, req.user.sub);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.shiftsService.findAll(orgId);
  }
}
