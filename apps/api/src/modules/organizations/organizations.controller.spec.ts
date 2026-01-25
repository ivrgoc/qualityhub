import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization, OrganizationPlan } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User, UserRole } from '../users/entities/user.entity';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let service: jest.Mocked<OrganizationsService>;

  const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    settings: null,
    plan: OrganizationPlan.FREE,
    createdAt: new Date('2024-01-01'),
    users: [],
  };

  const mockOrganizations: Organization[] = [
    mockOrganization,
    {
      id: 'org-456',
      name: 'Other Organization',
      slug: 'other-org',
      settings: { theme: 'dark' },
      plan: OrganizationPlan.PROFESSIONAL,
      createdAt: new Date('2024-01-02'),
      users: [],
    },
  ];

  const mockUser: User = {
    id: 'user-123',
    organizationId: 'org-123',
    organization: null as any,
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: UserRole.TESTER,
    settings: null,
    createdAt: new Date('2024-01-01'),
    refreshTokens: [],
  };

  const mockMembers: User[] = [
    mockUser,
    {
      id: 'user-456',
      organizationId: 'org-123',
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
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByIdOrFail: jest.fn(),
            findBySlugOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getMembers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    service = module.get(OrganizationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createOrganizationDto: CreateOrganizationDto = {
      name: 'New Organization',
      slug: 'new-org',
    };

    it('should create and return a new organization', async () => {
      const newOrg = { ...mockOrganization, ...createOrganizationDto };
      service.create.mockResolvedValue(newOrg);

      const result = await controller.create(createOrganizationDto);

      expect(service.create).toHaveBeenCalledWith(createOrganizationDto);
      expect(result).toEqual(newOrg);
    });

    it('should throw ConflictException when slug already exists', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Organization with slug "new-org" already exists'),
      );

      await expect(controller.create(createOrganizationDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.create).toHaveBeenCalledWith(createOrganizationDto);
    });

    it('should create organization with all fields', async () => {
      const dtoWithAll: CreateOrganizationDto = {
        name: 'Enterprise Org',
        slug: 'enterprise-org',
        settings: { customField: 'value' },
        plan: OrganizationPlan.ENTERPRISE,
      };
      const newOrg = { ...mockOrganization, ...dtoWithAll };
      service.create.mockResolvedValue(newOrg);

      const result = await controller.create(dtoWithAll);

      expect(service.create).toHaveBeenCalledWith(dtoWithAll);
      expect(result.plan).toBe(OrganizationPlan.ENTERPRISE);
    });
  });

  describe('findAll', () => {
    it('should return an array of organizations', async () => {
      service.findAll.mockResolvedValue(mockOrganizations);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockOrganizations);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no organizations exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an organization by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockOrganization);

      const result = await controller.findOne('org-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('org-123');
      expect(result).toEqual(mockOrganization);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Organization with ID non-existent not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findByIdOrFail).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('findBySlug', () => {
    it('should return an organization by slug', async () => {
      service.findBySlugOrFail.mockResolvedValue(mockOrganization);

      const result = await controller.findBySlug('test-org');

      expect(service.findBySlugOrFail).toHaveBeenCalledWith('test-org');
      expect(result).toEqual(mockOrganization);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.findBySlugOrFail.mockRejectedValue(
        new NotFoundException('Organization with slug "non-existent" not found'),
      );

      await expect(controller.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findBySlugOrFail).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('update', () => {
    const updateOrganizationDto: UpdateOrganizationDto = {
      name: 'Updated Organization',
      plan: OrganizationPlan.PROFESSIONAL,
    };

    it('should update and return the organization', async () => {
      const updatedOrg = { ...mockOrganization, ...updateOrganizationDto };
      service.update.mockResolvedValue(updatedOrg);

      const result = await controller.update('org-123', updateOrganizationDto);

      expect(service.update).toHaveBeenCalledWith('org-123', updateOrganizationDto);
      expect(result).toEqual(updatedOrg);
      expect(result.name).toBe('Updated Organization');
      expect(result.plan).toBe(OrganizationPlan.PROFESSIONAL);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Organization with ID non-existent not found'),
      );

      await expect(
        controller.update('non-existent', updateOrganizationDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('non-existent', updateOrganizationDto);
    });

    it('should throw ConflictException when updating to existing slug', async () => {
      const dtoWithSlug: UpdateOrganizationDto = { slug: 'existing-slug' };
      service.update.mockRejectedValue(
        new ConflictException('Organization with slug "existing-slug" already exists'),
      );

      await expect(controller.update('org-123', dtoWithSlug)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateOrganizationDto = { name: 'New Name' };
      const updatedOrg = { ...mockOrganization, name: 'New Name' };
      service.update.mockResolvedValue(updatedOrg);

      const result = await controller.update('org-123', partialUpdate);

      expect(service.update).toHaveBeenCalledWith('org-123', partialUpdate);
      expect(result.name).toBe('New Name');
      expect(result.plan).toBe(OrganizationPlan.FREE);
    });
  });

  describe('remove', () => {
    it('should delete an organization successfully', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.remove('org-123');

      expect(service.delete).toHaveBeenCalledWith('org-123');
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Organization with ID non-existent not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.delete).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('getCurrentOrganization', () => {
    it('should return the current user\'s organization', async () => {
      service.findByIdOrFail.mockResolvedValue(mockOrganization);

      const result = await controller.getCurrentOrganization(mockUser);

      expect(service.findByIdOrFail).toHaveBeenCalledWith('org-123');
      expect(result).toEqual(mockOrganization);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Organization with ID org-123 not found'),
      );

      await expect(controller.getCurrentOrganization(mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findByIdOrFail).toHaveBeenCalledWith('org-123');
    });
  });

  describe('updateCurrentOrganization', () => {
    const updateOrganizationDto: UpdateOrganizationDto = {
      name: 'Updated Organization',
      plan: OrganizationPlan.PROFESSIONAL,
    };

    it('should update and return the current user\'s organization', async () => {
      const updatedOrg = { ...mockOrganization, ...updateOrganizationDto };
      service.update.mockResolvedValue(updatedOrg);

      const result = await controller.updateCurrentOrganization(
        mockUser,
        updateOrganizationDto,
      );

      expect(service.update).toHaveBeenCalledWith('org-123', updateOrganizationDto);
      expect(result).toEqual(updatedOrg);
      expect(result.name).toBe('Updated Organization');
      expect(result.plan).toBe(OrganizationPlan.PROFESSIONAL);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Organization with ID org-123 not found'),
      );

      await expect(
        controller.updateCurrentOrganization(mockUser, updateOrganizationDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('org-123', updateOrganizationDto);
    });

    it('should throw ConflictException when updating to existing slug', async () => {
      const dtoWithSlug: UpdateOrganizationDto = { slug: 'existing-slug' };
      service.update.mockRejectedValue(
        new ConflictException('Organization with slug "existing-slug" already exists'),
      );

      await expect(
        controller.updateCurrentOrganization(mockUser, dtoWithSlug),
      ).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('org-123', dtoWithSlug);
    });
  });

  describe('getCurrentOrganizationMembers', () => {
    it('should return members of the current user\'s organization', async () => {
      service.getMembers.mockResolvedValue(mockMembers);

      const result = await controller.getCurrentOrganizationMembers(mockUser);

      expect(service.getMembers).toHaveBeenCalledWith('org-123');
      expect(result).toEqual(mockMembers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no members exist', async () => {
      service.getMembers.mockResolvedValue([]);

      const result = await controller.getCurrentOrganizationMembers(mockUser);

      expect(service.getMembers).toHaveBeenCalledWith('org-123');
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when organization not found', async () => {
      service.getMembers.mockRejectedValue(
        new NotFoundException('Organization with ID org-123 not found'),
      );

      await expect(controller.getCurrentOrganizationMembers(mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getMembers).toHaveBeenCalledWith('org-123');
    });
  });
});
