import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

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
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                'jwt.secret': 'test-secret',
                'jwt.accessTokenExpiry': 900,
                'jwt.refreshTokenExpiry': 604800,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should register a new user successfully', async () => {
      const createdUser: User = {
        id: 'new-user-123',
        orgId: 'org-456',
        email: registerDto.email,
        passwordHash: 'hashed-password',
        name: registerDto.name,
        role: UserRole.TESTER,
        createdAt: new Date(),
      };

      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        name: registerDto.name,
        passwordHash: 'hashed-password',
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toEqual({
        id: createdUser.id,
        orgId: createdUser.orgId,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already registered',
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'refresh-token-123';

      const result = await service.logout(refreshToken);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should invalidate the refresh token', async () => {
      const refreshToken = 'refresh-token-to-invalidate';
      await service.logout(refreshToken);

      // Attempt to use the invalidated token should fail
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      await expect(
        service.refresh({ refreshToken }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto = { refreshToken: 'valid-refresh-token' };

    it('should refresh tokens successfully', async () => {
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce(newAccessToken)
        .mockReturnValueOnce(newRefreshToken);

      const result = await service.refresh(refreshTokenDto);

      expect(jwtService.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        { secret: 'test-secret' },
      );
      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

    it('should throw UnauthorizedException when token is invalidated', async () => {
      const invalidatedToken = 'invalidated-token';
      await service.logout(invalidatedToken);

      await expect(
        service.refresh({ refreshToken: invalidatedToken }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refresh({ refreshToken: invalidatedToken }),
      ).rejects.toThrow('Token has been invalidated');
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'non-existent-user',
        email: 'test@example.com',
        role: UserRole.TESTER,
      });
      usersService.findById.mockResolvedValue(null);

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should invalidate old refresh token after successful refresh (token rotation)', async () => {
      const oldRefreshToken = 'old-refresh-token';
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      await service.refresh({ refreshToken: oldRefreshToken });

      // Old refresh token should now be invalidated
      await expect(
        service.refresh({ refreshToken: oldRefreshToken }),
      ).rejects.toThrow('Token has been invalidated');
    });
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-123');

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.validateUser('non-existent');

      expect(usersService.findById).toHaveBeenCalledWith('non-existent');
      expect(result).toBeNull();
    });
  });
});
