import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Organization, OrganizationPlan } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repository: jest.Mocked<Repository<Organization>>;

  const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    settings: null,
    plan: OrganizationPlan.FREE,
    createdAt: new Date('2024-01-01'),
    users: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    repository = module.get(getRepositoryToken(Organization));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createOrganizationDto: CreateOrganizationDto = {
      name: 'New Organization',
      slug: 'new-org',
    };

    it('should create a new organization', async () => {
      const newOrg = { ...mockOrganization, ...createOrganizationDto };
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(newOrg);
      repository.save.mockResolvedValue(newOrg);

      const result = await service.create(createOrganizationDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'new-org' },
      });
      expect(repository.create).toHaveBeenCalledWith(createOrganizationDto);
      expect(repository.save).toHaveBeenCalledWith(newOrg);
      expect(result).toEqual(newOrg);
    });

    it('should throw ConflictException when slug already exists', async () => {
      repository.findOne.mockResolvedValue(mockOrganization);

      await expect(service.create(createOrganizationDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createOrganizationDto)).rejects.toThrow(
        `Organization with slug "new-org" already exists`,
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should create organization with optional fields', async () => {
      const dtoWithOptionals: CreateOrganizationDto = {
        name: 'Enterprise Org',
        slug: 'enterprise-org',
        settings: { theme: 'dark' },
        plan: OrganizationPlan.ENTERPRISE,
      };
      const newOrg = { ...mockOrganization, ...dtoWithOptionals };
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(newOrg);
      repository.save.mockResolvedValue(newOrg);

      const result = await service.create(dtoWithOptionals);

      expect(repository.create).toHaveBeenCalledWith(dtoWithOptionals);
      expect(result.plan).toBe(OrganizationPlan.ENTERPRISE);
      expect(result.settings).toEqual({ theme: 'dark' });
    });
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      const organizations = [mockOrganization];
      repository.find.mockResolvedValue(organizations);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(organizations);
    });

    it('should return empty array when no organizations exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find an organization by id', async () => {
      repository.findOne.mockResolvedValue(mockOrganization);

      const result = await service.findById('org-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
      expect(result).toEqual(mockOrganization);
    });

    it('should return null when organization not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find an organization by id', async () => {
      repository.findOne.mockResolvedValue(mockOrganization);

      const result = await service.findByIdOrFail('org-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
      expect(result).toEqual(mockOrganization);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        'Organization with ID non-existent not found',
      );
    });
  });

  describe('findBySlug', () => {
    it('should find an organization by slug', async () => {
      repository.findOne.mockResolvedValue(mockOrganization);

      const result = await service.findBySlug('test-org');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-org' },
      });
      expect(result).toEqual(mockOrganization);
    });

    it('should return null when organization not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySlugOrFail', () => {
    it('should find an organization by slug', async () => {
      repository.findOne.mockResolvedValue(mockOrganization);

      const result = await service.findBySlugOrFail('test-org');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-org' },
      });
      expect(result).toEqual(mockOrganization);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlugOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findBySlugOrFail('non-existent')).rejects.toThrow(
        'Organization with slug "non-existent" not found',
      );
    });
  });

  describe('update', () => {
    const updateOrganizationDto: UpdateOrganizationDto = {
      name: 'Updated Organization',
    };

    it('should update an existing organization', async () => {
      const updatedOrg = { ...mockOrganization, ...updateOrganizationDto };
      repository.findOne.mockResolvedValue({ ...mockOrganization });
      repository.save.mockResolvedValue(updatedOrg);

      const result = await service.update('org-123', updateOrganizationDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'org-123',
          name: 'Updated Organization',
        }),
      );
      expect(result).toEqual(updatedOrg);
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateOrganizationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update slug when provided and unique', async () => {
      const dtoWithSlug: UpdateOrganizationDto = {
        slug: 'new-unique-slug',
      };
      const existingOrg = { ...mockOrganization };
      const updatedOrg = { ...mockOrganization, slug: 'new-unique-slug' };

      repository.findOne
        .mockResolvedValueOnce(existingOrg)
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue(updatedOrg);

      const result = await service.update('org-123', dtoWithSlug);

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(result.slug).toBe('new-unique-slug');
    });

    it('should throw ConflictException when updating to existing slug', async () => {
      const dtoWithSlug: UpdateOrganizationDto = {
        slug: 'existing-slug',
      };
      const existingOrg = { ...mockOrganization };
      const anotherOrg = { ...mockOrganization, id: 'org-456', slug: 'existing-slug' };

      repository.findOne
        .mockResolvedValueOnce(existingOrg)
        .mockResolvedValueOnce(anotherOrg);

      await expect(service.update('org-123', dtoWithSlug)).rejects.toThrow(
        new ConflictException('Organization with slug "existing-slug" already exists'),
      );
    });

    it('should allow updating with same slug', async () => {
      const dtoWithSameSlug: UpdateOrganizationDto = {
        name: 'Updated Name',
        slug: 'test-org',
      };
      const existingOrg = { ...mockOrganization };
      const updatedOrg = { ...mockOrganization, name: 'Updated Name' };

      repository.findOne.mockResolvedValue(existingOrg);
      repository.save.mockResolvedValue(updatedOrg);

      const result = await service.update('org-123', dtoWithSameSlug);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Updated Name');
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateOrganizationDto = {
        settings: { notifications: true },
      };
      const existingOrg = { ...mockOrganization };
      const updatedOrg = { ...mockOrganization, settings: { notifications: true } };

      repository.findOne.mockResolvedValue(existingOrg);
      repository.save.mockResolvedValue(updatedOrg);

      const result = await service.update('org-123', partialUpdate);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
          settings: { notifications: true },
        }),
      );
      expect(result.settings).toEqual({ notifications: true });
    });
  });

  describe('delete', () => {
    it('should delete an existing organization', async () => {
      repository.findOne.mockResolvedValue(mockOrganization);
      repository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.delete('org-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
      expect(repository.delete).toHaveBeenCalledWith('org-123');
    });

    it('should throw NotFoundException when organization not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
