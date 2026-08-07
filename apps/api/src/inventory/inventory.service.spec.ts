import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              location: { findFirst: jest.fn().mockResolvedValue({ id: 'loc-1' }) },
              productVariant: { findFirst: jest.fn().mockResolvedValue({ id: 'var-1' }) },
              $transaction: jest.fn((callback) => callback({
                inventoryLevel: {
                  findUnique: jest.fn().mockResolvedValue({ quantity: 10 }),
                  upsert: jest.fn().mockResolvedValue({}),
                },
                inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
              })),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adjust', () => {
    it('should throw error if deducting more than available', async () => {
      // Mock the transaction's findUnique to return quantity = 5
      (prismaService.client.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          inventoryLevel: {
            findUnique: jest.fn().mockResolvedValue({ quantity: 5 }),
          }
        });
      });

      await expect(
        service.adjust('org-1', 'user-1', { locationId: 'loc-1', variantId: 'var-1', quantity: -10, reason: 'Lost' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully add inventory', async () => {
      await service.adjust('org-1', 'user-1', { locationId: 'loc-1', variantId: 'var-1', quantity: 10, reason: 'Restock' });
      expect(prismaService.client.$transaction).toHaveBeenCalled();
    });
  });
});
