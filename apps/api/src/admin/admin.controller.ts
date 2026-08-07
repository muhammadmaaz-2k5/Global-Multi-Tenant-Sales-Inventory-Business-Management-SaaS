import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProvisionTenantDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// In a real app we'd have a @Roles('SUPER_ADMIN') guard here.
// For demonstration, we just require authentication for /admin routes.
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('organizations')
  getOrganizations() {
    return this.adminService.getOrganizations();
  }

  @Post('organizations')
  provisionTenant(@Body() dto: ProvisionTenantDto) {
    return this.adminService.provisionTenant(dto);
  }
}
