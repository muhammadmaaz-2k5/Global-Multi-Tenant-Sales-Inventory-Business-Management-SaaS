import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreatePurchaseOrderDto } from './dto/purchase-orders.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, OrgMemberGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
@Controller('organizations/:orgId/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreatePurchaseOrderDto) {
    return this.poService.create(orgId, dto);
  }

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.poService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.poService.findOne(orgId, id);
  }

  @Patch(':id/receive')
  receive(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const userId = req.user!.sub;
    return this.poService.receive(orgId, id, userId);
  }
}
