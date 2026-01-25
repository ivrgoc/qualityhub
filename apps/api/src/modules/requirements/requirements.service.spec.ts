import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RequirementsService } from './requirements.service';
import { Requirement, RequirementStatus, RequirementSource } from './entities/requirement.entity';
import { RequirementCoverage } from './entities/requirement-coverage.entity';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';

describe('RequirementsService', () => {
  let service: RequirementsService;
  let requirementRepository: jest.Mocked<Repository<Requirement>>;
  let coverageRepository: jest.Mocked<Repository<RequirementCoverage>>;

  const mockRequirement: Requirement = {
    id: 'req-123',
    projectId: 'proj-123',
    project: null,
    externalId: 'JIRA-456',
    title: 'User should be able to reset password',
    description: 'Password reset via email link',
    source: RequirementSource.JIRA,
    status: RequirementStatus.DRAFT,
    customFields: null,
    createdBy: 'user-123',
    coverages: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockCoverage: RequirementCoverage = {
    id: 'cov-123',
    requirementId: 'req-123',
    requirement: null,
    testCaseId: 'case-456',
    testCase: null,
    createdBy: 'user-123',
    createdAt: new Date('2024-01-01'),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequirementsService,
        {
          provide: getRepositoryToken(Requirement),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RequirementCoverage),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<RequirementsService>(RequirementsService);
    requirementRepository = module.get(getRepositoryToken(Requirement));
    coverageRepository = module.get(getRepositoryToken(RequirementCoverage));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============ Requirement Operations ============

  describe('create', () => {
    const createRequirementDto: CreateRequirementDto = {
      title: 'New Requirement',
      description: 'A new requirement',
      externalId: 'JIRA-789',
      source: RequirementSource.JIRA,
    };

    it('should create a new requirement', async () => {
      const newRequirement = { ...mockRequirement, ...createRequirementDto };
      requirementRepository.create.mockReturnValue(newRequirement);
      requirementRepository.save.mockResolvedValue(newRequirement);

      const result = await service.create('proj-123', createRequirementDto, 'user-123');

      expect(requirementRepository.create).toHaveBeenCalledWith({
        ...createRequirementDto,
        projectId: 'proj-123',
        createdBy: 'user-123',
      });
      expect(requirementRepository.save).toHaveBeenCalledWith(newRequirement);
      expect(result).toEqual(newRequirement);
    });

    it('should create a requirement with only required fields', async () => {
      const minimalDto: CreateRequirementDto = {
        title: 'Minimal Requirement',
      };
      const newRequirement = { ...mockRequirement, ...minimalDto, description: null, externalId: null };
      requirementRepository.create.mockReturnValue(newRequirement);
      requirementRepository.save.mockResolvedValue(newRequirement);

      const result = await service.create('proj-123', minimalDto);

      expect(requirementRepository.create).toHaveBeenCalledWith({
        ...minimalDto,
        projectId: 'proj-123',
        createdBy: null,
      });
      expect(result).toEqual(newRequirement);
    });

    it('should create a requirement with custom fields', async () => {
      const dtoWithCustomFields: CreateRequirementDto = {
        ...createRequirementDto,
        customFields: { priority: 'high', component: 'auth' },
      };
      const newRequirement = { ...mockRequirement, ...dtoWithCustomFields };
      requirementRepository.create.mockReturnValue(newRequirement);
      requirementRepository.save.mockResolvedValue(newRequirement);

      const result = await service.create('proj-123', dtoWithCustomFields, 'user-123');

      expect(requirementRepository.create).toHaveBeenCalledWith({
        ...dtoWithCustomFields,
        projectId: 'proj-123',
        createdBy: 'user-123',
      });
      expect(result.customFields).toEqual({ priority: 'high', component: 'auth' });
    });

    it('should create a requirement with status', async () => {
      const dtoWithStatus: CreateRequirementDto = {
        ...createRequirementDto,
        status: RequirementStatus.APPROVED,
      };
      const newRequirement = { ...mockRequirement, ...dtoWithStatus };
      requirementRepository.create.mockReturnValue(newRequirement);
      requirementRepository.save.mockResolvedValue(newRequirement);

      const result = await service.create('proj-123', dtoWithStatus, 'user-123');

      expect(result.status).toBe(RequirementStatus.APPROVED);
    });
  });

  describe('findAllByProject', () => {
    it('should return all requirements for a project', async () => {
      const requirements = [mockRequirement];
      requirementRepository.find.mockResolvedValue(requirements);

      const result = await service.findAllByProject('proj-123');

      expect(requirementRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(requirements);
    });

    it('should return empty array when no requirements exist', async () => {
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.findAllByProject('proj-123');

      expect(result).toEqual([]);
    });

    it('should return multiple requirements ordered by createdAt', async () => {
      const requirements = [
        { ...mockRequirement, id: 'req-1', createdAt: new Date('2024-01-01') },
        { ...mockRequirement, id: 'req-2', createdAt: new Date('2024-02-01') },
      ];
      requirementRepository.find.mockResolvedValue(requirements);

      const result = await service.findAllByProject('proj-123');

      expect(result).toHaveLength(2);
      expect(requirementRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should find a requirement by id and projectId', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);

      const result = await service.findById('proj-123', 'req-123');

      expect(requirementRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'req-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockRequirement);
    });

    it('should return null when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('proj-123', 'non-existent');

      expect(result).toBeNull();
    });

    it('should return null when requirement exists but belongs to different project', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('different-proj', 'req-123');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a requirement by id and projectId', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);

      const result = await service.findByIdOrFail('proj-123', 'req-123');

      expect(requirementRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'req-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockRequirement);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        'Requirement with ID non-existent not found',
      );
    });
  });

  describe('findByIdWithCoverage', () => {
    it('should find a requirement with coverages', async () => {
      const requirementWithCoverages = {
        ...mockRequirement,
        coverages: [mockCoverage],
      };
      requirementRepository.findOne.mockResolvedValue(requirementWithCoverages);

      const result = await service.findByIdWithCoverage('proj-123', 'req-123');

      expect(requirementRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'req-123', projectId: 'proj-123' },
        relations: ['coverages', 'coverages.testCase'],
      });
      expect(result).toEqual(requirementWithCoverages);
      expect(result.coverages).toHaveLength(1);
    });

    it('should return requirement with empty coverages array', async () => {
      const requirementWithNoCoverages = { ...mockRequirement, coverages: [] };
      requirementRepository.findOne.mockResolvedValue(requirementWithNoCoverages);

      const result = await service.findByIdWithCoverage('proj-123', 'req-123');

      expect(result.coverages).toEqual([]);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdWithCoverage('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdWithCoverage('proj-123', 'non-existent')).rejects.toThrow(
        'Requirement with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const updateRequirementDto: UpdateRequirementDto = {
      title: 'Updated Requirement',
    };

    it('should update an existing requirement', async () => {
      const updatedRequirement = { ...mockRequirement, ...updateRequirementDto };
      requirementRepository.findOne.mockResolvedValue({ ...mockRequirement });
      requirementRepository.save.mockResolvedValue(updatedRequirement);

      const result = await service.update('proj-123', 'req-123', updateRequirementDto);

      expect(requirementRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'req-123', projectId: 'proj-123' },
      });
      expect(requirementRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'req-123',
          title: 'Updated Requirement',
        }),
      );
      expect(result).toEqual(updatedRequirement);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-123', 'non-existent', updateRequirementDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateRequirementDto = {
        status: RequirementStatus.APPROVED,
      };
      const existingRequirement = { ...mockRequirement };
      const updatedRequirement = { ...mockRequirement, status: RequirementStatus.APPROVED };

      requirementRepository.findOne.mockResolvedValue(existingRequirement);
      requirementRepository.save.mockResolvedValue(updatedRequirement);

      const result = await service.update('proj-123', 'req-123', partialUpdate);

      expect(requirementRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'req-123',
          title: 'User should be able to reset password',
          status: RequirementStatus.APPROVED,
        }),
      );
      expect(result.status).toBe(RequirementStatus.APPROVED);
    });

    it('should update description', async () => {
      const updateDto: UpdateRequirementDto = {
        description: 'New description',
      };
      const existingRequirement = { ...mockRequirement };
      const updatedRequirement = { ...mockRequirement, description: 'New description' };

      requirementRepository.findOne.mockResolvedValue(existingRequirement);
      requirementRepository.save.mockResolvedValue(updatedRequirement);

      const result = await service.update('proj-123', 'req-123', updateDto);

      expect(result.description).toBe('New description');
    });

    it('should update externalId', async () => {
      const updateDto: UpdateRequirementDto = {
        externalId: 'JIRA-999',
      };
      const existingRequirement = { ...mockRequirement };
      const updatedRequirement = { ...mockRequirement, externalId: 'JIRA-999' };

      requirementRepository.findOne.mockResolvedValue(existingRequirement);
      requirementRepository.save.mockResolvedValue(updatedRequirement);

      const result = await service.update('proj-123', 'req-123', updateDto);

      expect(result.externalId).toBe('JIRA-999');
    });

    it('should update source', async () => {
      const updateDto: UpdateRequirementDto = {
        source: RequirementSource.GITHUB,
      };
      const existingRequirement = { ...mockRequirement };
      const updatedRequirement = { ...mockRequirement, source: RequirementSource.GITHUB };

      requirementRepository.findOne.mockResolvedValue(existingRequirement);
      requirementRepository.save.mockResolvedValue(updatedRequirement);

      const result = await service.update('proj-123', 'req-123', updateDto);

      expect(result.source).toBe(RequirementSource.GITHUB);
    });

    it('should update customFields', async () => {
      const updateDto: UpdateRequirementDto = {
        customFields: { priority: 'low', newField: 'value' },
      };
      const existingRequirement = { ...mockRequirement };
      const updatedRequirement = { ...mockRequirement, customFields: updateDto.customFields };

      requirementRepository.findOne.mockResolvedValue(existingRequirement);
      requirementRepository.save.mockResolvedValue(updatedRequirement);

      const result = await service.update('proj-123', 'req-123', updateDto);

      expect(result.customFields).toEqual({ priority: 'low', newField: 'value' });
    });
  });

  describe('delete', () => {
    it('should soft delete an existing requirement', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      requirementRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.delete('proj-123', 'req-123');

      expect(requirementRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'req-123', projectId: 'proj-123' },
      });
      expect(requirementRepository.softDelete).toHaveBeenCalledWith('req-123');
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(requirementRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should not delete requirement from different project', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('different-proj', 'req-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(requirementRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  // ============ Coverage Operations ============

  describe('getCoverage', () => {
    it('should return coverages for a requirement', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.find.mockResolvedValue([mockCoverage]);

      const result = await service.getCoverage('proj-123', 'req-123');

      expect(coverageRepository.find).toHaveBeenCalledWith({
        where: { requirementId: 'req-123' },
        relations: ['testCase'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([mockCoverage]);
    });

    it('should return empty array when no coverages exist', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.find.mockResolvedValue([]);

      const result = await service.getCoverage('proj-123', 'req-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(service.getCoverage('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(coverageRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('addCoverage', () => {
    const testCaseIds = ['case-456', 'case-789'];

    it('should add new coverages to a requirement', async () => {
      const newCoverages = [
        { ...mockCoverage, id: 'cov-1', testCaseId: 'case-456' },
        { ...mockCoverage, id: 'cov-2', testCaseId: 'case-789' },
      ];

      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.find.mockResolvedValue([]);
      coverageRepository.create
        .mockReturnValueOnce(newCoverages[0])
        .mockReturnValueOnce(newCoverages[1]);
      coverageRepository.save.mockResolvedValue(newCoverages);

      const result = await service.addCoverage('proj-123', 'req-123', testCaseIds, 'user-123');

      expect(coverageRepository.find).toHaveBeenCalledWith({
        where: {
          requirementId: 'req-123',
          testCaseId: In(testCaseIds),
        },
      });
      expect(coverageRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(newCoverages);
    });

    it('should skip existing coverages', async () => {
      const existingCoverage = { ...mockCoverage, testCaseId: 'case-456' };
      const newCoverage = { ...mockCoverage, id: 'cov-2', testCaseId: 'case-789' };

      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.find.mockResolvedValue([existingCoverage]);
      coverageRepository.create.mockReturnValue(newCoverage);
      coverageRepository.save.mockResolvedValue([newCoverage]);

      const result = await service.addCoverage('proj-123', 'req-123', testCaseIds, 'user-123');

      expect(coverageRepository.create).toHaveBeenCalledTimes(1);
      expect(coverageRepository.create).toHaveBeenCalledWith({
        requirementId: 'req-123',
        testCaseId: 'case-789',
        createdBy: 'user-123',
      });
      expect(result).toEqual([newCoverage]);
    });

    it('should return empty array when all coverages already exist', async () => {
      const existingCoverages = [
        { ...mockCoverage, testCaseId: 'case-456' },
        { ...mockCoverage, testCaseId: 'case-789' },
      ];

      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.find.mockResolvedValue(existingCoverages);

      const result = await service.addCoverage('proj-123', 'req-123', testCaseIds);

      expect(result).toEqual([]);
      expect(coverageRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addCoverage('proj-123', 'non-existent', testCaseIds),
      ).rejects.toThrow(NotFoundException);
      expect(coverageRepository.find).not.toHaveBeenCalled();
    });

    it('should add coverage without createdBy when not provided', async () => {
      const newCoverage = { ...mockCoverage, createdBy: null };

      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.find.mockResolvedValue([]);
      coverageRepository.create.mockReturnValue(newCoverage);
      coverageRepository.save.mockResolvedValue([newCoverage]);

      await service.addCoverage('proj-123', 'req-123', ['case-456']);

      expect(coverageRepository.create).toHaveBeenCalledWith({
        requirementId: 'req-123',
        testCaseId: 'case-456',
        createdBy: null,
      });
    });
  });

  describe('removeCoverage', () => {
    it('should remove a coverage from requirement', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.findOne.mockResolvedValue(mockCoverage);
      coverageRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.removeCoverage('proj-123', 'req-123', 'case-456');

      expect(coverageRepository.findOne).toHaveBeenCalledWith({
        where: { requirementId: 'req-123', testCaseId: 'case-456' },
      });
      expect(coverageRepository.delete).toHaveBeenCalledWith('cov-123');
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeCoverage('proj-123', 'non-existent', 'case-456'),
      ).rejects.toThrow(NotFoundException);
      expect(coverageRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when coverage not found', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeCoverage('proj-123', 'req-123', 'non-existent-case'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.removeCoverage('proj-123', 'req-123', 'non-existent-case'),
      ).rejects.toThrow(
        'Coverage for test case non-existent-case not found in requirement req-123',
      );
      expect(coverageRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ============ Coverage Statistics ============

  describe('getCoverageStatistics', () => {
    it('should return coverage statistics for a requirement', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.count.mockResolvedValue(5);

      const result = await service.getCoverageStatistics('proj-123', 'req-123');

      expect(coverageRepository.count).toHaveBeenCalledWith({
        where: { requirementId: 'req-123' },
      });
      expect(result).toEqual({
        requirementId: 'req-123',
        totalTestCases: 5,
      });
    });

    it('should return 0 test cases when no coverages exist', async () => {
      requirementRepository.findOne.mockResolvedValue(mockRequirement);
      coverageRepository.count.mockResolvedValue(0);

      const result = await service.getCoverageStatistics('proj-123', 'req-123');

      expect(result).toEqual({
        requirementId: 'req-123',
        totalTestCases: 0,
      });
    });

    it('should throw NotFoundException when requirement not found', async () => {
      requirementRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getCoverageStatistics('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      expect(coverageRepository.count).not.toHaveBeenCalled();
    });
  });

  describe('getProjectCoverageStatistics', () => {
    it('should return project coverage statistics', async () => {
      const requirements = [
        { ...mockRequirement, id: 'req-1' },
        { ...mockRequirement, id: 'req-2' },
        { ...mockRequirement, id: 'req-3' },
      ];
      requirementRepository.find.mockResolvedValue(requirements);
      mockQueryBuilder.getRawOne.mockResolvedValue({ count: '2' });

      const result = await service.getProjectCoverageStatistics('proj-123');

      expect(requirementRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        select: ['id'],
      });
      expect(result).toEqual({
        totalRequirements: 3,
        coveredRequirements: 2,
        uncoveredRequirements: 1,
        coveragePercentage: 67,
      });
    });

    it('should return 100% coverage when all requirements are covered', async () => {
      const requirements = [
        { ...mockRequirement, id: 'req-1' },
        { ...mockRequirement, id: 'req-2' },
      ];
      requirementRepository.find.mockResolvedValue(requirements);
      mockQueryBuilder.getRawOne.mockResolvedValue({ count: '2' });

      const result = await service.getProjectCoverageStatistics('proj-123');

      expect(result).toEqual({
        totalRequirements: 2,
        coveredRequirements: 2,
        uncoveredRequirements: 0,
        coveragePercentage: 100,
      });
    });

    it('should return 0% coverage when no requirements are covered', async () => {
      const requirements = [
        { ...mockRequirement, id: 'req-1' },
        { ...mockRequirement, id: 'req-2' },
      ];
      requirementRepository.find.mockResolvedValue(requirements);
      mockQueryBuilder.getRawOne.mockResolvedValue({ count: '0' });

      const result = await service.getProjectCoverageStatistics('proj-123');

      expect(result).toEqual({
        totalRequirements: 2,
        coveredRequirements: 0,
        uncoveredRequirements: 2,
        coveragePercentage: 0,
      });
    });

    it('should return all zeros when no requirements exist', async () => {
      requirementRepository.find.mockResolvedValue([]);

      const result = await service.getProjectCoverageStatistics('proj-123');

      expect(result).toEqual({
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
      });
      expect(coverageRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should round coverage percentage correctly', async () => {
      const requirements = [
        { ...mockRequirement, id: 'req-1' },
        { ...mockRequirement, id: 'req-2' },
        { ...mockRequirement, id: 'req-3' },
      ];
      requirementRepository.find.mockResolvedValue(requirements);
      mockQueryBuilder.getRawOne.mockResolvedValue({ count: '1' });

      const result = await service.getProjectCoverageStatistics('proj-123');

      expect(result.coveragePercentage).toBe(33); // 1/3 = 33.33% rounded to 33
    });
  });
});
