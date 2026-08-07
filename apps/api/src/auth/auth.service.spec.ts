import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: PrismaService, 
          useValue: { 
            client: { user: { findUnique: jest.fn() } } 
          } 
        },
        { 
          provide: JwtService, 
          useValue: { signAsync: jest.fn().mockResolvedValue('mocked-token') } 
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully log in a user and return a token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };
      
      // Mock Prisma to return the user
      (prismaService.client.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock bcrypt to return true
      (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(prismaService.client.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'user-1', email: 'test@example.com' });
      expect(result).toEqual({ access_token: 'mocked-token' });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      // Mock Prisma to return null (user not found)
      (prismaService.client.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'password123' }))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };
      
      (prismaService.client.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock bcrypt to return false
      (bcrypt.compare as jest.Mock).mockImplementationOnce(async () => false);

      await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' }))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
