import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TestPlansController } from './test-plans.controller';
import { TestPlansService } from './test-plans.service';
import { TestPlan } from './entities/test-plan.entity';
import { TestPlanEntry } from './entities/test-plan-entry.entity';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';
import { CreateTestPlanEntryDto } from './dto/create-test-plan-entry.dto';
import { UpdateTestPlanEntryDto } from './dto/update-test-plan-entry.dto';
import { AddEntriesDto } from './dto/add-entries.dto';

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
    entries: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockEntry: TestPlanEntry = {
    id: 'entry-123',
    testPlanId: 'plan-123',
    testPlan: null,
    testCaseId: 'case-456',
    testCase: null,
    position: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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
            getEntries: jest.fn(),
            addEntry: jest.fn(),
            addEntries: jest.fn(),
            updateEntry: jest.fn(),
            removeEntry: jest.fn(),
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

  describe('getEntries', () => {
    it('should return entries for a test plan', async () => {
      service.getEntries.mockResolvedValue([mockEntry]);

      const result = await controller.getEntries('proj-123', 'plan-123');

      expect(service.getEntries).toHaveBeenCalledWith('proj-123', 'plan-123');
      expect(result).toEqual([mockEntry]);
    });

    it('should return empty array when no entries exist', async () => {
      service.getEntries.mockResolvedValue([]);

      const result = await controller.getEntries('proj-123', 'plan-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.getEntries.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(controller.getEntries('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addEntry', () => {
    const createEntryDto: CreateTestPlanEntryDto = {
      testCaseId: 'case-456',
    };

    it('should add an entry to a test plan', async () => {
      service.addEntry.mockResolvedValue(mockEntry);

      const result = await controller.addEntry('proj-123', 'plan-123', createEntryDto);

      expect(service.addEntry).toHaveBeenCalledWith('proj-123', 'plan-123', createEntryDto);
      expect(result).toEqual(mockEntry);
    });

    it('should add an entry with position', async () => {
      const entryWithPosition: CreateTestPlanEntryDto = {
        testCaseId: 'case-789',
        position: 5,
      };
      const newEntry = { ...mockEntry, testCaseId: 'case-789', position: 5 };
      service.addEntry.mockResolvedValue(newEntry);

      const result = await controller.addEntry('proj-123', 'plan-123', entryWithPosition);

      expect(service.addEntry).toHaveBeenCalledWith('proj-123', 'plan-123', entryWithPosition);
      expect(result.position).toBe(5);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.addEntry.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(
        controller.addEntry('proj-123', 'non-existent', createEntryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when test case already in plan', async () => {
      service.addEntry.mockRejectedValue(
        new ConflictException('Test case case-456 is already in this test plan'),
      );

      await expect(
        controller.addEntry('proj-123', 'plan-123', createEntryDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('addEntries', () => {
    const addEntriesDto: AddEntriesDto = {
      testCaseIds: ['case-1', 'case-2'],
    };

    it('should add multiple entries to a test plan', async () => {
      const entries = [
        { ...mockEntry, id: 'entry-1', testCaseId: 'case-1' },
        { ...mockEntry, id: 'entry-2', testCaseId: 'case-2' },
      ];
      service.addEntries.mockResolvedValue(entries);

      const result = await controller.addEntries('proj-123', 'plan-123', addEntriesDto);

      expect(service.addEntries).toHaveBeenCalledWith('proj-123', 'plan-123', ['case-1', 'case-2']);
      expect(result).toEqual(entries);
    });

    it('should return empty array when all entries already exist', async () => {
      service.addEntries.mockResolvedValue([]);

      const result = await controller.addEntries('proj-123', 'plan-123', addEntriesDto);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.addEntries.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(
        controller.addEntries('proj-123', 'non-existent', addEntriesDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEntry', () => {
    const updateEntryDto: UpdateTestPlanEntryDto = {
      position: 5,
    };

    it('should update an entry', async () => {
      const updatedEntry = { ...mockEntry, position: 5 };
      service.updateEntry.mockResolvedValue(updatedEntry);

      const result = await controller.updateEntry(
        'proj-123',
        'plan-123',
        'entry-123',
        updateEntryDto,
      );

      expect(service.updateEntry).toHaveBeenCalledWith(
        'proj-123',
        'plan-123',
        'entry-123',
        updateEntryDto,
      );
      expect(result.position).toBe(5);
    });

    it('should throw NotFoundException when entry not found', async () => {
      service.updateEntry.mockRejectedValue(
        new NotFoundException('Entry with ID non-existent not found'),
      );

      await expect(
        controller.updateEntry('proj-123', 'plan-123', 'non-existent', updateEntryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.updateEntry.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(
        controller.updateEntry('proj-123', 'non-existent', 'entry-123', updateEntryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEntry', () => {
    it('should remove an entry from a test plan', async () => {
      service.removeEntry.mockResolvedValue(undefined);

      await controller.removeEntry('proj-123', 'plan-123', 'entry-123');

      expect(service.removeEntry).toHaveBeenCalledWith('proj-123', 'plan-123', 'entry-123');
    });

    it('should throw NotFoundException when entry not found', async () => {
      service.removeEntry.mockRejectedValue(
        new NotFoundException('Entry with ID non-existent not found'),
      );

      await expect(
        controller.removeEntry('proj-123', 'plan-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      service.removeEntry.mockRejectedValue(
        new NotFoundException('Test plan with ID non-existent not found'),
      );

      await expect(
        controller.removeEntry('proj-123', 'non-existent', 'entry-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
