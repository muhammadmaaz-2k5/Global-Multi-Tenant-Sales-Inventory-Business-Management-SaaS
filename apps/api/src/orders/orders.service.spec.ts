import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              $transaction: jest.fn((callback) => callback({
                order: { create: jest.fn().mockResolvedValue({ id: 'order-1' }) },
                inventoryLevel: {
                  findUnique: jest.fn().mockResolvedValue({ quantity: 10 }),
                  upsert: jest.fn().mockResolvedValue({}),
                },
                inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
                posCart: { deleteMany: jest.fn().mockResolvedValue({}) },
              })),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should calculate totals correctly and create order', async () => {
      const dto = {
        locationId: 'loc-1',
        paymentMethod: 'CASH' as any,
        tax: 5,
        discount: 2,
        items: [
          { variantId: 'var-1', quantity: 2, unitPrice: 10 }, // 20
          { variantId: 'var-2', quantity: 1, unitPrice: 15, discount: 5 }, // 10
        ],
      }; // Subtotal = 30. Total = 30 + 5 - 2 = 33

      const result = await service.checkout('org-1', 'user-1', dto);

      expect(prismaService.client.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ id: 'order-1' });
    });
  });
});
