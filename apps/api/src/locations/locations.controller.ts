import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(
    @Param('orgId') orgId: string,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.locationsService.create(orgId, createLocationDto);
  }

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.locationsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.locationsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(orgId, id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.locationsService.remove(orgId, id);
  }
}
