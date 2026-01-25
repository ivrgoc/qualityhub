import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RequirementsController } from './requirements.controller';
import { RequirementsService } from './requirements.service';
import { Requirement, RequirementStatus, RequirementSource } from './entities/requirement.entity';
import { RequirementCoverage } from './entities/requirement-coverage.entity';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { AddCoverageDto } from './dto/add-coverage.dto';

describe('RequirementsController', () => {
  let controller: RequirementsController;
  let service: jest.Mocked<RequirementsService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequirementsController],
      providers: [
        {
          provide: RequirementsService,
          useValue: {
            create: jest.fn(),
            findAllByProject: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getCoverage: jest.fn(),
            addCoverage: jest.fn(),
            removeCoverage: jest.fn(),
            getCoverageStatistics: jest.fn(),
            getProjectCoverageStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RequirementsController>(RequirementsController);
    service = module.get(RequirementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============ Requirement Endpoints ============

  describe('create', () => {
    const createRequirementDto: CreateRequirementDto = {
      title: 'New Requirement',
      description: 'A new requirement description',
      externalId: 'JIRA-789',
      source: RequirementSource.JIRA,
    };

    it('should create a new requirement', async () => {
      const newRequirement = { ...mockRequirement, ...createRequirementDto };
      service.create.mockResolvedValue(newRequirement);

      const result = await controller.create('proj-123', createRequirementDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', createRequirementDto);
      expect(result).toEqual(newRequirement);
    });

    it('should create a requirement with minimal data', async () => {
      const minimalDto: CreateRequirementDto = {
        title: 'Minimal Requirement',
      };
      const newRequirement = { ...mockRequirement, title: 'Minimal Requirement' };
      service.create.mockResolvedValue(newRequirement);

      const result = await controller.create('proj-123', minimalDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', minimalDto);
      expect(result).toEqual(newRequirement);
    });

    it('should create a requirement with custom fields', async () => {
      const dtoWithCustomFields: CreateRequirementDto = {
        title: 'Requirement with custom fields',
        customFields: { priority: 'high', component: 'auth' },
      };
      const newRequirement = { ...mockRequirement, ...dtoWithCustomFields };
      service.create.mockResolvedValue(newRequirement);

      const result = await controller.create('proj-123', dtoWithCustomFields);

      expect(service.create).toHaveBeenCalledWith('proj-123', dtoWithCustomFields);
      expect(result.customFields).toEqual({ priority: 'high', component: 'auth' });
    });
  });

  describe('findAll', () => {
    it('should return all requirements for a project', async () => {
      const requirements = [mockRequirement];
      service.findAllByProject.mockResolvedValue(requirements);

      const result = await controller.findAll('proj-123');

      expect(service.findAllByProject).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(requirements);
    });

    it('should return empty array when no requirements exist', async () => {
      service.findAllByProject.mockResolvedValue([]);

      const result = await controller.findAll('proj-123');

      expect(result).toEqual([]);
    });

    it('should return multiple requirements', async () => {
      const requirements = [
        mockRequirement,
        { ...mockRequirement, id: 'req-456', title: 'Another Requirement' },
      ];
      service.findAllByProject.mockResolvedValue(requirements);

      const result = await controller.findAll('proj-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return a requirement by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockRequirement);

      const result = await controller.findById('proj-123', 'req-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123', 'req-123');
      expect(result).toEqual(mockRequirement);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(controller.findById('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateRequirementDto: UpdateRequirementDto = {
      title: 'Updated Requirement',
      description: 'Updated description',
    };

    it('should update a requirement', async () => {
      const updatedRequirement = { ...mockRequirement, ...updateRequirementDto };
      service.update.mockResolvedValue(updatedRequirement);

      const result = await controller.update('proj-123', 'req-123', updateRequirementDto);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'req-123', updateRequirementDto);
      expect(result).toEqual(updatedRequirement);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(
        controller.update('proj-123', 'non-existent', updateRequirementDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only status', async () => {
      const statusUpdate: UpdateRequirementDto = {
        status: RequirementStatus.APPROVED,
      };
      const updatedRequirement = { ...mockRequirement, status: RequirementStatus.APPROVED };
      service.update.mockResolvedValue(updatedRequirement);

      const result = await controller.update('proj-123', 'req-123', statusUpdate);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'req-123', statusUpdate);
      expect(result.status).toBe(RequirementStatus.APPROVED);
    });
  });

  describe('delete', () => {
    it('should delete a requirement', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123', 'req-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123', 'req-123');
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(controller.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ Coverage Endpoints ============

  describe('getCoverage', () => {
    it('should return coverages for a requirement', async () => {
      const coverages = [mockCoverage];
      service.getCoverage.mockResolvedValue(coverages);

      const result = await controller.getCoverage('proj-123', 'req-123');

      expect(service.getCoverage).toHaveBeenCalledWith('proj-123', 'req-123');
      expect(result).toEqual(coverages);
    });

    it('should return empty array when no coverages exist', async () => {
      service.getCoverage.mockResolvedValue([]);

      const result = await controller.getCoverage('proj-123', 'req-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.getCoverage.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(controller.getCoverage('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return multiple coverages', async () => {
      const coverages = [
        mockCoverage,
        { ...mockCoverage, id: 'cov-456', testCaseId: 'case-789' },
      ];
      service.getCoverage.mockResolvedValue(coverages);

      const result = await controller.getCoverage('proj-123', 'req-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('addCoverage', () => {
    const addCoverageDto: AddCoverageDto = {
      testCaseIds: ['case-456', 'case-789'],
    };

    it('should add coverage to a requirement', async () => {
      const newCoverages = [
        { ...mockCoverage, testCaseId: 'case-456' },
        { ...mockCoverage, id: 'cov-456', testCaseId: 'case-789' },
      ];
      service.addCoverage.mockResolvedValue(newCoverages);

      const result = await controller.addCoverage('proj-123', 'req-123', addCoverageDto);

      expect(service.addCoverage).toHaveBeenCalledWith('proj-123', 'req-123', addCoverageDto.testCaseIds);
      expect(result).toEqual(newCoverages);
    });

    it('should return empty array when all coverages already exist', async () => {
      service.addCoverage.mockResolvedValue([]);

      const result = await controller.addCoverage('proj-123', 'req-123', addCoverageDto);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.addCoverage.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(
        controller.addCoverage('proj-123', 'non-existent', addCoverageDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should add single coverage', async () => {
      const singleCoverageDto: AddCoverageDto = {
        testCaseIds: ['case-456'],
      };
      const newCoverage = [mockCoverage];
      service.addCoverage.mockResolvedValue(newCoverage);

      const result = await controller.addCoverage('proj-123', 'req-123', singleCoverageDto);

      expect(service.addCoverage).toHaveBeenCalledWith('proj-123', 'req-123', ['case-456']);
      expect(result).toHaveLength(1);
    });
  });

  describe('removeCoverage', () => {
    it('should remove coverage from a requirement', async () => {
      service.removeCoverage.mockResolvedValue(undefined);

      await controller.removeCoverage('proj-123', 'req-123', 'case-456');

      expect(service.removeCoverage).toHaveBeenCalledWith('proj-123', 'req-123', 'case-456');
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.removeCoverage.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(
        controller.removeCoverage('proj-123', 'non-existent', 'case-456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when coverage not found', async () => {
      service.removeCoverage.mockRejectedValue(
        new NotFoundException('Coverage for test case non-existent-case not found in requirement req-123'),
      );

      await expect(
        controller.removeCoverage('proj-123', 'req-123', 'non-existent-case'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ Statistics Endpoints ============

  describe('getStatistics', () => {
    it('should return coverage statistics for a requirement', async () => {
      const stats = {
        requirementId: 'req-123',
        totalTestCases: 5,
      };
      service.getCoverageStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics('proj-123', 'req-123');

      expect(service.getCoverageStatistics).toHaveBeenCalledWith('proj-123', 'req-123');
      expect(result).toEqual(stats);
    });

    it('should return zero test cases when no coverage exists', async () => {
      const stats = {
        requirementId: 'req-123',
        totalTestCases: 0,
      };
      service.getCoverageStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics('proj-123', 'req-123');

      expect(result.totalTestCases).toBe(0);
    });

    it('should throw NotFoundException when requirement not found', async () => {
      service.getCoverageStatistics.mockRejectedValue(
        new NotFoundException('Requirement with ID non-existent not found'),
      );

      await expect(controller.getStatistics('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProjectStatistics', () => {
    it('should return project coverage statistics', async () => {
      const stats = {
        totalRequirements: 10,
        coveredRequirements: 7,
        uncoveredRequirements: 3,
        coveragePercentage: 70,
      };
      service.getProjectCoverageStatistics.mockResolvedValue(stats);

      const result = await controller.getProjectStatistics('proj-123');

      expect(service.getProjectCoverageStatistics).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(stats);
    });

    it('should return zeros when no requirements exist', async () => {
      const stats = {
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
      };
      service.getProjectCoverageStatistics.mockResolvedValue(stats);

      const result = await controller.getProjectStatistics('proj-123');

      expect(result).toEqual(stats);
    });

    it('should return 100% coverage when all requirements covered', async () => {
      const stats = {
        totalRequirements: 5,
        coveredRequirements: 5,
        uncoveredRequirements: 0,
        coveragePercentage: 100,
      };
      service.getProjectCoverageStatistics.mockResolvedValue(stats);

      const result = await controller.getProjectStatistics('proj-123');

      expect(result.coveragePercentage).toBe(100);
      expect(result.uncoveredRequirements).toBe(0);
    });

    it('should return 0% coverage when no requirements covered', async () => {
      const stats = {
        totalRequirements: 5,
        coveredRequirements: 0,
        uncoveredRequirements: 5,
        coveragePercentage: 0,
      };
      service.getProjectCoverageStatistics.mockResolvedValue(stats);

      const result = await controller.getProjectStatistics('proj-123');

      expect(result.coveragePercentage).toBe(0);
      expect(result.coveredRequirements).toBe(0);
    });
  });
});
