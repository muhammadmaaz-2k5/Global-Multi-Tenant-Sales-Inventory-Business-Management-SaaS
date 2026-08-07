import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { JwtService } from '@nestjs/jwt';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        
        
    { provide: PrismaService, useValue: { client: { user: {}, organization: {}, product: {}, order: {} } } },
    { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn() } },
    { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } }
  ,
        {
          provide: OrdersService,
          useValue: {}
        }
      ].filter(Boolean),
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
