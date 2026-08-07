import { Test, TestingModule } from '@nestjs/testing';
import { PosCartsController } from './pos-carts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { JwtService } from '@nestjs/jwt';
import { PosCartsService } from './pos-carts.service';

describe('PosCartsController', () => {
  let controller: PosCartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosCartsController],
      providers: [
        
        
    { provide: PrismaService, useValue: { client: { user: {}, organization: {}, product: {}, order: {} } } },
    { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
    { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } }
  ,
        {
          provide: PosCartsService,
          useValue: {}
        }
      ].filter(Boolean),
    }).compile();

    controller = module.get<PosCartsController>(PosCartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
