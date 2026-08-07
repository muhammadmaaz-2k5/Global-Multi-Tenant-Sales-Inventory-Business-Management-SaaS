import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    sub: string;
    email: string;
  };
}
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  async getMyOrganizations(@Request() req: AuthenticatedRequest) {
    return this.orgService.getOrganizationsForUser(req.user.sub);
  }

  @Get(':id')
  async getOrganizationDetails(
    @Param('id') orgId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.orgService.getOrganizationDetails(orgId, req.user.sub);
  }
}
