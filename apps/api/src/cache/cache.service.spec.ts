import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(),
      set: jest.fn(),
      disconnect: jest.fn(),
    };
  });
});

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize redis client on module init', () => {
    service.onModuleInit();
    expect(Redis).toHaveBeenCalled();
    expect(service.client).toBeDefined();
  });

  it('should call disconnect on module destroy', () => {
    service.onModuleInit(); // ensure client exists
    service.onModuleDestroy();
    expect(service.client.disconnect).toHaveBeenCalled();
  });

  it('should call get on redis client', async () => {
    service.onModuleInit();
    (service.client.get as jest.Mock).mockResolvedValue('test-value');
    
    const result = await service.get('test-key');
    
    expect(service.client.get).toHaveBeenCalledWith('test-key');
    expect(result).toBe('test-value');
  });

  it('should call set without TTL', async () => {
    service.onModuleInit();
    await service.set('test-key', 'test-value');
    
    expect(service.client.set).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('should call set with TTL', async () => {
    service.onModuleInit();
    await service.set('test-key', 'test-value', 3600);
    
    expect(service.client.set).toHaveBeenCalledWith('test-key', 'test-value', 'EX', 3600);
  });
});
