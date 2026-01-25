import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TestPlansService } from './test-plans.service';
import { TestPlan } from './entities/test-plan.entity';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';

describe('TestPlansService', () => {
  let service: TestPlansService;
  let testPlanRepository: jest.Mocked<Repository<TestPlan>>;

  const mockTestPlan: TestPlan = {
    id: 'plan-123',
    projectId: 'proj-123',
    project: null,
    milestoneId: 'milestone-456',
    milestone: null,
    name: 'Q1 Regression Tests',
    description: 'Comprehensive regression test plan',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestPlansService,
        {
          provide: getRepositoryToken(TestPlan),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TestPlansService>(TestPlansService);
    testPlanRepository = module.get(getRepositoryToken(TestPlan));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTestPlanDto: CreateTestPlanDto = {
      name: 'New Test Plan',
      description: 'A new test plan',
      milestoneId: 'milestone-789',
    };

    it('should create a new test plan', async () => {
      const newTestPlan = { ...mockTestPlan, ...createTestPlanDto };
      testPlanRepository.create.mockReturnValue(newTestPlan);
      testPlanRepository.save.mockResolvedValue(newTestPlan);

      const result = await service.create('proj-123', createTestPlanDto);

      expect(testPlanRepository.create).toHaveBeenCalledWith({
        ...createTestPlanDto,
        projectId: 'proj-123',
      });
      expect(testPlanRepository.save).toHaveBeenCalledWith(newTestPlan);
      expect(result).toEqual(newTestPlan);
    });

    it('should create a test plan with only required fields', async () => {
      const minimalDto: CreateTestPlanDto = {
        name: 'Minimal Test Plan',
      };
      const newTestPlan = { ...mockTestPlan, ...minimalDto, description: null, milestoneId: null };
      testPlanRepository.create.mockReturnValue(newTestPlan);
      testPlanRepository.save.mockResolvedValue(newTestPlan);

      const result = await service.create('proj-123', minimalDto);

      expect(testPlanRepository.create).toHaveBeenCalledWith({
        ...minimalDto,
        projectId: 'proj-123',
      });
      expect(result).toEqual(newTestPlan);
    });

    it('should create a test plan without milestone', async () => {
      const dtoWithoutMilestone: CreateTestPlanDto = {
        name: 'Standalone Test Plan',
        description: 'No milestone attached',
      };
      const newTestPlan = { ...mockTestPlan, ...dtoWithoutMilestone, milestoneId: null };
      testPlanRepository.create.mockReturnValue(newTestPlan);
      testPlanRepository.save.mockResolvedValue(newTestPlan);

      const result = await service.create('proj-123', dtoWithoutMilestone);

      expect(testPlanRepository.create).toHaveBeenCalledWith({
        ...dtoWithoutMilestone,
        projectId: 'proj-123',
      });
      expect(result.milestoneId).toBeNull();
    });
  });

  describe('findAllByProject', () => {
    it('should return all test plans for a project', async () => {
      const testPlans = [mockTestPlan];
      testPlanRepository.find.mockResolvedValue(testPlans);

      const result = await service.findAllByProject('proj-123');

      expect(testPlanRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(testPlans);
    });

    it('should return empty array when no test plans exist', async () => {
      testPlanRepository.find.mockResolvedValue([]);

      const result = await service.findAllByProject('proj-123');

      expect(result).toEqual([]);
    });

    it('should return multiple test plans ordered by createdAt', async () => {
      const testPlans = [
        { ...mockTestPlan, id: 'plan-1', createdAt: new Date('2024-01-01') },
        { ...mockTestPlan, id: 'plan-2', createdAt: new Date('2024-02-01') },
      ];
      testPlanRepository.find.mockResolvedValue(testPlans);

      const result = await service.findAllByProject('proj-123');

      expect(result).toHaveLength(2);
      expect(testPlanRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should find a test plan by id and projectId', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);

      const result = await service.findById('proj-123', 'plan-123');

      expect(testPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockTestPlan);
    });

    it('should return null when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('proj-123', 'non-existent');

      expect(result).toBeNull();
    });

    it('should return null when test plan exists but belongs to different project', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('different-proj', 'plan-123');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a test plan by id and projectId', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);

      const result = await service.findByIdOrFail('proj-123', 'plan-123');

      expect(testPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockTestPlan);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        'Test plan with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const updateTestPlanDto: UpdateTestPlanDto = {
      name: 'Updated Test Plan',
    };

    it('should update an existing test plan', async () => {
      const updatedTestPlan = { ...mockTestPlan, ...updateTestPlanDto };
      testPlanRepository.findOne.mockResolvedValue({ ...mockTestPlan });
      testPlanRepository.save.mockResolvedValue(updatedTestPlan);

      const result = await service.update('proj-123', 'plan-123', updateTestPlanDto);

      expect(testPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-123', projectId: 'proj-123' },
      });
      expect(testPlanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'plan-123',
          name: 'Updated Test Plan',
        }),
      );
      expect(result).toEqual(updatedTestPlan);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-123', 'non-existent', updateTestPlanDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateTestPlanDto = {
        description: 'Updated description',
      };
      const existingTestPlan = { ...mockTestPlan };
      const updatedTestPlan = { ...mockTestPlan, description: 'Updated description' };

      testPlanRepository.findOne.mockResolvedValue(existingTestPlan);
      testPlanRepository.save.mockResolvedValue(updatedTestPlan);

      const result = await service.update('proj-123', 'plan-123', partialUpdate);

      expect(testPlanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'plan-123',
          name: 'Q1 Regression Tests',
          description: 'Updated description',
        }),
      );
      expect(result.description).toBe('Updated description');
    });

    it('should update milestone association', async () => {
      const updateDto: UpdateTestPlanDto = {
        milestoneId: 'new-milestone-id',
      };
      const existingTestPlan = { ...mockTestPlan };
      const updatedTestPlan = { ...mockTestPlan, milestoneId: 'new-milestone-id' };

      testPlanRepository.findOne.mockResolvedValue(existingTestPlan);
      testPlanRepository.save.mockResolvedValue(updatedTestPlan);

      const result = await service.update('proj-123', 'plan-123', updateDto);

      expect(result.milestoneId).toBe('new-milestone-id');
    });

    it('should remove milestone association when set to null', async () => {
      const updateDto: UpdateTestPlanDto = {
        milestoneId: null,
      };
      const existingTestPlan = { ...mockTestPlan };
      const updatedTestPlan = { ...mockTestPlan, milestoneId: null };

      testPlanRepository.findOne.mockResolvedValue(existingTestPlan);
      testPlanRepository.save.mockResolvedValue(updatedTestPlan);

      const result = await service.update('proj-123', 'plan-123', updateDto);

      expect(result.milestoneId).toBeNull();
    });
  });

  describe('delete', () => {
    it('should soft delete an existing test plan', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.delete('proj-123', 'plan-123');

      expect(testPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-123', projectId: 'proj-123' },
      });
      expect(testPlanRepository.softDelete).toHaveBeenCalledWith('plan-123');
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(testPlanRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should not delete test plan from different project', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('different-proj', 'plan-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(testPlanRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('findByIdWithMilestone', () => {
    it('should find a test plan with milestone', async () => {
      const testPlanWithMilestone = {
        ...mockTestPlan,
        milestone: {
          id: 'milestone-456',
          name: 'Q1 Release',
          projectId: 'proj-123',
        },
      };
      testPlanRepository.findOne.mockResolvedValue(testPlanWithMilestone);

      const result = await service.findByIdWithMilestone('proj-123', 'plan-123');

      expect(testPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-123', projectId: 'proj-123' },
        relations: ['milestone'],
      });
      expect(result).toEqual(testPlanWithMilestone);
      expect(result.milestone).toBeDefined();
    });

    it('should return test plan with null milestone', async () => {
      const testPlanNoMilestone = { ...mockTestPlan, milestone: null, milestoneId: null };
      testPlanRepository.findOne.mockResolvedValue(testPlanNoMilestone);

      const result = await service.findByIdWithMilestone('proj-123', 'plan-123');

      expect(result.milestone).toBeNull();
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdWithMilestone('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdWithMilestone('proj-123', 'non-existent')).rejects.toThrow(
        'Test plan with ID non-existent not found',
      );
    });
  });
});
