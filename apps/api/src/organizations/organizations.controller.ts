import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  async getMyOrganizations(@Request() req: any) {
    return this.orgService.getOrganizationsForUser(req.user.sub);
  }

  @Get(':id')
  async getOrganizationDetails(@Param('id') orgId: string, @Request() req: any) {
    return this.orgService.getOrganizationDetails(orgId, req.user.sub);
  }
}
