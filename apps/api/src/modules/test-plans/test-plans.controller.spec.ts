import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TestPlansController } from './test-plans.controller';
import { TestPlansService } from './test-plans.service';
import { TestPlan } from './entities/test-plan.entity';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';

describe('TestPlansController', () => {
  let controller: TestPlansController;
  let service: jest.Mocked<TestPlansService>;

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
      controllers: [TestPlansController],
      providers: [
        {
          provide: TestPlansService,
          useValue: {
            create: jest.fn(),
            findAllByProject: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByIdWithMilestone: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestPlansController>(TestPlansController);
    service = module.get(TestPlansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTestPlanDto: CreateTestPlanDto = {
      name: 'New Test Plan',
      description: 'A new test plan',
      milestoneId: 'milestone-789',
    };

    it('should create a new test plan', async () => {
      const newTestPlan = { ...mockTestPlan, ...createTestPlanDto };
      service.create.mockResolvedValue(newTestPlan);

      const result = await controller.create('proj-123', createTestPlanDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', createTestPlanDto);
      expect(result).toEqual(newTestPlan);
    });

    it('should create a test plan with minimal data', async () => {
      const minimalDto: CreateTestPlanDto = {
        name: 'Minimal Test Plan',
      };
      const newTestPlan = { ...mockTestPlan, name: 'Minimal Test Plan' };
      service.create.mockResolvedValue(newTestPlan);

      const result = await controller.create('proj-123', minimalDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', minimalDto);
      expect(result).toEqual(newTestPlan);
    });
  });

  describe('findAll', () => {
    it('should return all test plans for a project', async () => {
      const testPlans = [mockTestPlan];
      service.findAllByProject.mockResolvedValue(testPlans);

      const result = await controller.findAll('proj-123');

      expect(service.findAllByProject).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(testPlans);
    });

    it('should return empty array when no test plans exist', async () => {
      service.findAllByProject.mockResolvedValue([]);

      const result = await controller.findAll('proj-123');

      expect(result).toEqual([]);
    });

    it('should return multiple test plans', async () => {
      const testPlans = [
        mockTestPlan,
        { ...mockTestPlan, id: 'plan-456', name: 'Q2 Smoke Tests' },
      ];
      service.findAllByProject.mockResolvedValue(testPlans);

      const result = await controller.findAll('proj-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return a test plan by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockTestPlan);

      const result = await controller.findById('proj-123', 'plan-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123', 'plan-123');
      expect(result).toEqual(mockTestPlan);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(controller.findById('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateTestPlanDto: UpdateTestPlanDto = {
      name: 'Updated Test Plan',
      description: 'Updated description',
    };

    it('should update a test plan', async () => {
      const updatedTestPlan = { ...mockTestPlan, ...updateTestPlanDto };
      service.update.mockResolvedValue(updatedTestPlan);

      const result = await controller.update('proj-123', 'plan-123', updateTestPlanDto);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'plan-123', updateTestPlanDto);
      expect(result).toEqual(updatedTestPlan);
      expect(result.name).toBe('Updated Test Plan');
      expect(result.description).toBe('Updated description');
    });

    it('should update a test plan with partial data', async () => {
      const partialUpdate: UpdateTestPlanDto = {
        name: 'Only Name Updated',
      };
      const updatedTestPlan = { ...mockTestPlan, name: 'Only Name Updated' };
      service.update.mockResolvedValue(updatedTestPlan);

      const result = await controller.update('proj-123', 'plan-123', partialUpdate);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'plan-123', partialUpdate);
      expect(result.name).toBe('Only Name Updated');
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(
        controller.update('proj-123', 'non-existent', updateTestPlanDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a test plan', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123', 'plan-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123', 'plan-123');
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(controller.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWithMilestone', () => {
    const mockTestPlanWithMilestone = {
      ...mockTestPlan,
      milestone: {
        id: 'milestone-456',
        name: 'Q1 Release',
        projectId: 'proj-123',
      },
    };

    it('should return test plan with milestone', async () => {
      service.findByIdWithMilestone.mockResolvedValue(mockTestPlanWithMilestone);

      const result = await controller.getWithMilestone('proj-123', 'plan-123');

      expect(service.findByIdWithMilestone).toHaveBeenCalledWith('proj-123', 'plan-123');
      expect(result).toEqual(mockTestPlanWithMilestone);
      expect(result.milestone).toBeDefined();
    });

    it('should return test plan with null milestone', async () => {
      const testPlanNoMilestone = { ...mockTestPlan, milestone: null };
      service.findByIdWithMilestone.mockResolvedValue(testPlanNoMilestone);

      const result = await controller.getWithMilestone('proj-123', 'plan-123');

      expect(result.milestone).toBeNull();
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.findByIdWithMilestone.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(controller.getWithMilestone('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
