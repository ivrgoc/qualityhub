import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TestPlansService } from './test-plans.service';
import { TestPlan } from './entities/test-plan.entity';
import { TestPlanEntry } from './entities/test-plan-entry.entity';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';
import { CreateTestPlanEntryDto } from './dto/create-test-plan-entry.dto';
import { UpdateTestPlanEntryDto } from './dto/update-test-plan-entry.dto';

describe('TestPlansService', () => {
  let service: TestPlansService;
  let testPlanRepository: jest.Mocked<Repository<TestPlan>>;
  let testPlanEntryRepository: jest.Mocked<Repository<TestPlanEntry>>;

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

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
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
        {
          provide: getRepositoryToken(TestPlanEntry),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<TestPlansService>(TestPlansService);
    testPlanRepository = module.get(getRepositoryToken(TestPlan));
    testPlanEntryRepository = module.get(getRepositoryToken(TestPlanEntry));
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

  describe('findByIdWithEntries', () => {
    it('should find a test plan with entries', async () => {
      const testPlanWithEntries = {
        ...mockTestPlan,
        entries: [mockEntry],
      };
      testPlanRepository.findOne.mockResolvedValue(testPlanWithEntries);

      const result = await service.findByIdWithEntries('proj-123', 'plan-123');

      expect(testPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-123', projectId: 'proj-123' },
        relations: ['entries', 'entries.testCase'],
      });
      expect(result).toEqual(testPlanWithEntries);
      expect(result.entries).toHaveLength(1);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdWithEntries('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEntries', () => {
    it('should return entries for a test plan', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.find.mockResolvedValue([mockEntry]);

      const result = await service.getEntries('proj-123', 'plan-123');

      expect(testPlanEntryRepository.find).toHaveBeenCalledWith({
        where: { testPlanId: 'plan-123' },
        relations: ['testCase'],
        order: { position: 'ASC' },
      });
      expect(result).toEqual([mockEntry]);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.getEntries('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array when no entries exist', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.find.mockResolvedValue([]);

      const result = await service.getEntries('proj-123', 'plan-123');

      expect(result).toEqual([]);
    });
  });

  describe('addEntry', () => {
    const createEntryDto: CreateTestPlanEntryDto = {
      testCaseId: 'case-456',
    };

    it('should add a new entry to test plan', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(null);
      mockQueryBuilder.getRawOne.mockResolvedValue({ maxPosition: null });
      testPlanEntryRepository.create.mockReturnValue(mockEntry);
      testPlanEntryRepository.save.mockResolvedValue(mockEntry);

      const result = await service.addEntry('proj-123', 'plan-123', createEntryDto);

      expect(testPlanEntryRepository.create).toHaveBeenCalledWith({
        testPlanId: 'plan-123',
        testCaseId: 'case-456',
        position: 0,
      });
      expect(result).toEqual(mockEntry);
    });

    it('should throw ConflictException when test case already in plan', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(mockEntry);

      await expect(
        service.addEntry('proj-123', 'plan-123', createEntryDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should add entry with specified position', async () => {
      const entryWithPosition: CreateTestPlanEntryDto = {
        testCaseId: 'case-789',
        position: 5,
      };
      const newEntry = { ...mockEntry, testCaseId: 'case-789', position: 5 };

      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(null);
      testPlanEntryRepository.create.mockReturnValue(newEntry);
      testPlanEntryRepository.save.mockResolvedValue(newEntry);

      const result = await service.addEntry('proj-123', 'plan-123', entryWithPosition);

      expect(testPlanEntryRepository.create).toHaveBeenCalledWith({
        testPlanId: 'plan-123',
        testCaseId: 'case-789',
        position: 5,
      });
      expect(result.position).toBe(5);
    });

    it('should auto-increment position when not specified', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(null);
      mockQueryBuilder.getRawOne.mockResolvedValue({ maxPosition: 3 });
      testPlanEntryRepository.create.mockReturnValue({ ...mockEntry, position: 4 });
      testPlanEntryRepository.save.mockResolvedValue({ ...mockEntry, position: 4 });

      const result = await service.addEntry('proj-123', 'plan-123', createEntryDto);

      expect(testPlanEntryRepository.create).toHaveBeenCalledWith({
        testPlanId: 'plan-123',
        testCaseId: 'case-456',
        position: 4,
      });
      expect(result.position).toBe(4);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addEntry('proj-123', 'non-existent', createEntryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addEntries', () => {
    it('should add multiple entries to test plan', async () => {
      const testCaseIds = ['case-1', 'case-2'];
      const entries = [
        { ...mockEntry, id: 'entry-1', testCaseId: 'case-1', position: 0 },
        { ...mockEntry, id: 'entry-2', testCaseId: 'case-2', position: 1 },
      ];

      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.find.mockResolvedValue([]);
      mockQueryBuilder.getRawOne.mockResolvedValue({ maxPosition: null });
      testPlanEntryRepository.create
        .mockReturnValueOnce(entries[0])
        .mockReturnValueOnce(entries[1]);
      testPlanEntryRepository.save.mockResolvedValue(entries);

      const result = await service.addEntries('proj-123', 'plan-123', testCaseIds);

      expect(result).toEqual(entries);
    });

    it('should skip existing entries', async () => {
      const testCaseIds = ['case-1', 'case-2'];
      const existingEntry = { ...mockEntry, testCaseId: 'case-1' };
      const newEntry = { ...mockEntry, id: 'entry-2', testCaseId: 'case-2', position: 1 };

      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.find.mockResolvedValue([existingEntry]);
      mockQueryBuilder.getRawOne.mockResolvedValue({ maxPosition: 0 });
      testPlanEntryRepository.create.mockReturnValue(newEntry);
      testPlanEntryRepository.save.mockResolvedValue([newEntry]);

      const result = await service.addEntries('proj-123', 'plan-123', testCaseIds);

      expect(testPlanEntryRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual([newEntry]);
    });

    it('should return empty array when all entries already exist', async () => {
      const testCaseIds = ['case-1'];
      const existingEntry = { ...mockEntry, testCaseId: 'case-1' };

      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.find.mockResolvedValue([existingEntry]);

      const result = await service.addEntries('proj-123', 'plan-123', testCaseIds);

      expect(result).toEqual([]);
      expect(testPlanEntryRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addEntries('proj-123', 'non-existent', ['case-1']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEntry', () => {
    const updateEntryDto: UpdateTestPlanEntryDto = {
      position: 5,
    };

    it('should update an entry', async () => {
      const updatedEntry = { ...mockEntry, position: 5 };
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue({ ...mockEntry });
      testPlanEntryRepository.save.mockResolvedValue(updatedEntry);

      const result = await service.updateEntry('proj-123', 'plan-123', 'entry-123', updateEntryDto);

      expect(result.position).toBe(5);
    });

    it('should throw NotFoundException when entry not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEntry('proj-123', 'plan-123', 'non-existent', updateEntryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEntry('proj-123', 'non-existent', 'entry-123', updateEntryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEntry', () => {
    it('should remove an entry', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(mockEntry);
      testPlanEntryRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.removeEntry('proj-123', 'plan-123', 'entry-123');

      expect(testPlanEntryRepository.delete).toHaveBeenCalledWith('entry-123');
    });

    it('should throw NotFoundException when entry not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeEntry('proj-123', 'plan-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeEntry('proj-123', 'non-existent', 'entry-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEntries', () => {
    it('should remove multiple entries', async () => {
      testPlanRepository.findOne.mockResolvedValue(mockTestPlan);
      testPlanEntryRepository.delete.mockResolvedValue({ affected: 2, raw: [] });

      await service.removeEntries('proj-123', 'plan-123', ['entry-1', 'entry-2']);

      expect(testPlanEntryRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when test plan not found', async () => {
      testPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeEntries('proj-123', 'non-existent', ['entry-1']),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
