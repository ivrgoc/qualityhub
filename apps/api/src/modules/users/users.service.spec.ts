import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan, UpdateResult, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;

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

  const mockRefreshToken: RefreshToken = {
    id: 'token-123',
    userId: 'user-123',
    user: mockUser,
    token: 'jwt-refresh-token',
    expiresAt: new Date('2024-02-01'),
    revokedAt: null,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        passwordHash: 'hashed-password',
        name: 'New User',
      };

      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByIdOrFail('user-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        'User with ID non-existent not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        role: UserRole.LEAD,
      };
      const existingUser = { ...mockUser };
      const updatedUser = { ...mockUser, ...updateUserDto };

      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          name: 'Updated Name',
          role: UserRole.LEAD,
        }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should update only provided fields', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'New Name Only',
      };
      const existingUser = { ...mockUser };
      const updatedUser = { ...mockUser, name: 'New Name Only' };

      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateUserDto);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          name: 'New Name Only',
          role: UserRole.TESTER,
        }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.delete('user-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(userRepository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token', async () => {
      const userId = 'user-123';
      const token = 'jwt-refresh-token';
      const expiresAt = new Date('2024-02-01');

      refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
      refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      const result = await service.createRefreshToken(userId, token, expiresAt);

      expect(refreshTokenRepository.create).toHaveBeenCalledWith({
        userId,
        token,
        expiresAt,
      });
      expect(refreshTokenRepository.save).toHaveBeenCalledWith(mockRefreshToken);
      expect(result).toEqual(mockRefreshToken);
    });
  });

  describe('findRefreshToken', () => {
    it('should find a valid refresh token', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      const result = await service.findRefreshToken('jwt-refresh-token');

      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: 'jwt-refresh-token', revokedAt: IsNull() },
        relations: ['user'],
      });
      expect(result).toEqual(mockRefreshToken);
    });

    it('should return null for non-existent token', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      const result = await service.findRefreshToken('non-existent-token');

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.revokeRefreshToken('jwt-refresh-token');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { token: 'jwt-refresh-token' },
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should revoke all refresh tokens for a user', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 3 } as UpdateResult);

      await service.revokeAllUserRefreshTokens('user-123');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', revokedAt: IsNull() },
        { revokedAt: expect.any(Date) },
      );
    });
  });

  describe('deleteExpiredRefreshTokens', () => {
    it('should delete expired refresh tokens and return count', async () => {
      refreshTokenRepository.delete.mockResolvedValue({ affected: 5 } as DeleteResult);

      const result = await service.deleteExpiredRefreshTokens();

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        expiresAt: LessThan(expect.any(Date)),
      });
      expect(result).toBe(5);
    });

    it('should return 0 when no tokens deleted', async () => {
      refreshTokenRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      const result = await service.deleteExpiredRefreshTokens();

      expect(result).toBe(0);
    });

    it('should return 0 when affected is undefined', async () => {
      refreshTokenRepository.delete.mockResolvedValue({} as DeleteResult);

      const result = await service.deleteExpiredRefreshTokens();

      expect(result).toBe(0);
    });
  });
});
