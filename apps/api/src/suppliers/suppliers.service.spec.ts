import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { JwtService } from '@nestjs/jwt';

describe('SuppliersService', () => {
  let service: SuppliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      
      providers: [
        SuppliersService,
        
    { provide: PrismaService, useValue: { client: { user: {}, organization: {}, product: {}, order: {} } } },
    { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
    { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } }
  
      ].filter(Boolean),
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
