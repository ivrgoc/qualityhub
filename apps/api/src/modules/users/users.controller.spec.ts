import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

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

  const mockUsers: User[] = [
    mockUser,
    {
      id: 'user-456',
      organizationId: 'org-456',
      organization: null as any,
      email: 'other@example.com',
      passwordHash: 'hashed-password',
      name: 'Other User',
      role: UserRole.LEAD,
      settings: null,
      createdAt: new Date('2024-01-02'),
      refreshTokens: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      usersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      usersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      usersService.findByIdOrFail.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-123');

      expect(usersService.findByIdOrFail).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.findByIdOrFail.mockRejectedValue(
        new NotFoundException('User with ID non-existent not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findByIdOrFail).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      role: UserRole.LEAD,
    };

    it('should update and return the user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      usersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-123', updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith('user-123', updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      expect(result.role).toBe(UserRole.LEAD);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.update.mockRejectedValue(
        new NotFoundException('User with ID non-existent not found'),
      );

      await expect(
        controller.update('non-existent', updateUserDto),
      ).rejects.toThrow(NotFoundException);
      expect(usersService.update).toHaveBeenCalledWith(
        'non-existent',
        updateUserDto,
      );
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateUserDto = { name: 'New Name' };
      const updatedUser = { ...mockUser, name: 'New Name' };
      usersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-123', partialUpdate);

      expect(usersService.update).toHaveBeenCalledWith('user-123', partialUpdate);
      expect(result.name).toBe('New Name');
      expect(result.role).toBe(UserRole.TESTER);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      usersService.delete.mockResolvedValue(undefined);

      const result = await controller.remove('user-123');

      expect(usersService.delete).toHaveBeenCalledWith('user-123');
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.delete.mockRejectedValue(
        new NotFoundException('User with ID non-existent not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.delete).toHaveBeenCalledWith('non-existent');
    });
  });
});
