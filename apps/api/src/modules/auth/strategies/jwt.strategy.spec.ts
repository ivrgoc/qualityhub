import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 'user-123',
    orgId: 'org-456',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: UserRole.TESTER,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      orgId: 'org-456',
      role: 'tester',
    };

    it('should return user when validation succeeds', async () => {
      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(authService.validateUser).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(payload.sub);
    });
  });
});
