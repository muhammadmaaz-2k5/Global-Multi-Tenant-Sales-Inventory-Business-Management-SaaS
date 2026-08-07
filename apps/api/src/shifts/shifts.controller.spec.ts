import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsController } from './shifts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { JwtService } from '@nestjs/jwt';
import { ShiftsService } from './shifts.service';

describe('ShiftsController', () => {
  let controller: ShiftsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftsController],
      providers: [
        
        
    { provide: PrismaService, useValue: { client: { user: {}, organization: {}, product: {}, order: {} } } },
    { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
    { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } }
  ,
        {
          provide: ShiftsService,
          useValue: {}
        }
      ].filter(Boolean),
    }).compile();

    controller = module.get<ShiftsController>(ShiftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
