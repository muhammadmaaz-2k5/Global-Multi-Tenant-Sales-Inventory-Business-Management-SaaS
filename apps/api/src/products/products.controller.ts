import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Param('orgId') orgId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(orgId, createProductDto);
  }

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('q') q?: string) {
    return this.productsService.findAll(orgId, q);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.productsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(orgId, id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.productsService.remove(orgId, id);
  }
}
