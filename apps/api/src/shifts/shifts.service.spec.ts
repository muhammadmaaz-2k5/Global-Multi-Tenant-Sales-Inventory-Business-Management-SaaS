import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { JwtService } from '@nestjs/jwt';

describe('ShiftsService', () => {
  let service: ShiftsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      
      providers: [
        ShiftsService,
        
    { provide: PrismaService, useValue: { client: { user: {}, organization: {}, product: {}, order: {} } } },
    { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
    { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } }
  
      ].filter(Boolean),
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
