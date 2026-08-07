import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { AdjustInventoryDto, TransferInventoryDto } from './dto/inventory.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getLevels(
    @Param('orgId') orgId: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.inventoryService.getLevels(orgId, locationId);
  }

  @Post('adjust')
  adjust(
    @Param('orgId') orgId: string,
    @Body() adjustDto: AdjustInventoryDto,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const userId = req.user!.sub;
    return this.inventoryService.adjust(orgId, userId, adjustDto);
  }

  @Post('transfer')
  transfer(
    @Param('orgId') orgId: string,
    @Body() transferDto: TransferInventoryDto,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const userId = req.user!.sub;
    return this.inventoryService.transfer(orgId, userId, transferDto);
  }
}
