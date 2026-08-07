import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { PosCartsService } from './pos-carts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { CreatePosCartDto } from './dto/pos-carts.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/pos-carts')
export class PosCartsController {
  constructor(private readonly posCartsService: PosCartsService) {}

  @Post()
  create(
    @Param('orgId') orgId: string,
    @Body() createPosCartDto: CreatePosCartDto,
    @Req() req: Request & { user?: { sub: string } },
  ) {
    const userId = req.user!.sub;
    return this.posCartsService.createOrSuspend(
      orgId,
      userId,
      createPosCartDto,
    );
  }

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.posCartsService.findSuspended(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.posCartsService.findOne(orgId, id);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.posCartsService.remove(orgId, id);
  }
}
