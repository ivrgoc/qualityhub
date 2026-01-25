import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { User, UserRole } from '../../users/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 'user-123',
    organizationId: 'org-456',
    organization: null as any,
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: UserRole.TESTER,
    settings: null,
    createdAt: new Date('2024-01-01'),
    refreshTokens: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUserCredentials: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should return user when credentials are valid', async () => {
      authService.validateUserCredentials.mockResolvedValue(mockUser);

      const result = await strategy.validate(email, password);

      expect(authService.validateUserCredentials).toHaveBeenCalledWith(
        email,
        password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.validateUserCredentials.mockResolvedValue(null);

      await expect(strategy.validate(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUserCredentials).toHaveBeenCalledWith(
        email,
        password,
      );
    });

    it('should throw UnauthorizedException with correct message when user not found', async () => {
      authService.validateUserCredentials.mockResolvedValue(null);

      await expect(strategy.validate(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
