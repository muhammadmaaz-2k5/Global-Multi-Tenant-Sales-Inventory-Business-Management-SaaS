import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { CheckoutDto } from './dto/orders.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(
    @Param('orgId') orgId: string,
    @Body() dto: CheckoutDto,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const userId = req.user!.sub;
    return this.ordersService.checkout(orgId, userId, dto);
  }

  @Post(':id/refund')
  refund(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const userId = req.user!.sub;
    return this.ordersService.refund(orgId, id, userId);
  }

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.ordersService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.ordersService.findOne(orgId, id);
  }
}
