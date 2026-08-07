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
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(orgId, dto);
  }

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.customersService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.customersService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.customersService.remove(orgId, id);
  }
}
