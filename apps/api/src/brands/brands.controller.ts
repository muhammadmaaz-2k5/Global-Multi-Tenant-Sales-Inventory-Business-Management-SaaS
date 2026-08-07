import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brands.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  create(
    @Param('orgId') orgId: string,
    @Body() createBrandDto: CreateBrandDto,
  ) {
    return this.brandsService.create(orgId, createBrandDto);
  }

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.brandsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.brandsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(orgId, id, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.brandsService.remove(orgId, id);
  }
}
