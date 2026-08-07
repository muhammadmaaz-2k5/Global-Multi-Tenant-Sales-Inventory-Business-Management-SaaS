import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    
    // Mock the $connect and $disconnect methods so we don't actually hit the DB during unit tests
    service.client.$connect = jest.fn().mockResolvedValue(undefined);
    service.client.$disconnect = jest.fn().mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should instantiate PrismaClient', () => {
    expect(service.client).toBeInstanceOf(PrismaClient);
  });

  it('should call $connect on module init', async () => {
    await service.onModuleInit();
    expect(service.client.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.client.$disconnect).toHaveBeenCalled();
  });
});
