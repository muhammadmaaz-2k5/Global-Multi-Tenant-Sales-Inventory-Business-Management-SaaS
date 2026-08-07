import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateLocationDto) {
    return this.prisma.client.location.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        type: dto.type || 'STORE',
        address: dto.address,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.location.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const location = await this.prisma.client.location.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(orgId: string, id: string, dto: UpdateLocationDto) {
    await this.findOne(orgId, id);
    return this.prisma.client.location.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.client.location.delete({
      where: { id },
    });
  }
}
