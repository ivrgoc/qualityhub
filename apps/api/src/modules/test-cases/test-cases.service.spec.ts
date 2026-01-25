import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { TestCase, TestCaseTemplate, Priority } from './entities/test-case.entity';
import { TestCaseVersion } from './entities/test-case-version.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';

describe('TestCasesService', () => {
  let service: TestCasesService;
  let testCaseRepository: jest.Mocked<Repository<TestCase>>;
  let testCaseVersionRepository: jest.Mocked<Repository<TestCaseVersion>>;

  const mockTestCase: TestCase = {
    id: 'tc-123',
    projectId: 'proj-123',
    project: null,
    title: 'Login with valid credentials',
    templateType: TestCaseTemplate.STEPS,
    preconditions: 'User is on login page',
    steps: [{ step: 1, action: 'Enter username' }],
    expectedResult: 'User is logged in',
    priority: Priority.HIGH,
    estimate: 5,
    customFields: null,
    version: 1,
    sectionId: null,
    section: null,
    createdBy: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockTestCaseVersion: TestCaseVersion = {
    id: 'version-123',
    testCaseId: 'tc-123',
    testCase: null,
    version: 1,
    data: {
      title: 'Login with valid credentials',
      templateType: TestCaseTemplate.STEPS,
      priority: Priority.HIGH,
    },
    changedBy: 'user-123',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestCasesService,
        {
          provide: getRepositoryToken(TestCase),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TestCaseVersion),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TestCasesService>(TestCasesService);
    testCaseRepository = module.get(getRepositoryToken(TestCase));
    testCaseVersionRepository = module.get(getRepositoryToken(TestCaseVersion));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTestCaseDto: CreateTestCaseDto = {
      title: 'Login with valid credentials',
      templateType: TestCaseTemplate.STEPS,
      priority: Priority.HIGH,
    };

    it('should create a new test case with version 1', async () => {
      const newTestCase = { ...mockTestCase, ...createTestCaseDto };
      testCaseRepository.create.mockReturnValue(newTestCase);
      testCaseRepository.save.mockResolvedValue(newTestCase);
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue(mockTestCaseVersion);

      const result = await service.create('proj-123', createTestCaseDto, 'user-123');

      expect(testCaseRepository.create).toHaveBeenCalledWith({
        ...createTestCaseDto,
        projectId: 'proj-123',
        createdBy: 'user-123',
        version: 1,
      });
      expect(testCaseRepository.save).toHaveBeenCalledWith(newTestCase);
      expect(testCaseVersionRepository.create).toHaveBeenCalled();
      expect(testCaseVersionRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newTestCase);
      expect(result.version).toBe(1);
    });

    it('should create a test case without userId', async () => {
      const newTestCase = { ...mockTestCase, createdBy: undefined };
      testCaseRepository.create.mockReturnValue(newTestCase);
      testCaseRepository.save.mockResolvedValue(newTestCase);
      testCaseVersionRepository.create.mockReturnValue({
        ...mockTestCaseVersion,
        changedBy: undefined,
      });
      testCaseVersionRepository.save.mockResolvedValue({
        ...mockTestCaseVersion,
        changedBy: undefined,
      });

      const result = await service.create('proj-123', createTestCaseDto);

      expect(testCaseRepository.create).toHaveBeenCalledWith({
        ...createTestCaseDto,
        projectId: 'proj-123',
        createdBy: undefined,
        version: 1,
      });
      expect(result).toEqual(newTestCase);
    });

    it('should create a version snapshot when creating a test case', async () => {
      const newTestCase = { ...mockTestCase };
      testCaseRepository.create.mockReturnValue(newTestCase);
      testCaseRepository.save.mockResolvedValue(newTestCase);
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue(mockTestCaseVersion);

      await service.create('proj-123', createTestCaseDto, 'user-123');

      expect(testCaseVersionRepository.create).toHaveBeenCalledWith({
        testCaseId: newTestCase.id,
        version: 1,
        data: expect.objectContaining({
          title: newTestCase.title,
          templateType: newTestCase.templateType,
          priority: newTestCase.priority,
        }),
        changedBy: 'user-123',
      });
      expect(testCaseVersionRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAllByProject', () => {
    it('should return all test cases for a project', async () => {
      const testCases = [mockTestCase];
      testCaseRepository.find.mockResolvedValue(testCases);

      const result = await service.findAllByProject('proj-123');

      expect(testCaseRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(testCases);
    });

    it('should return empty array when no test cases exist', async () => {
      testCaseRepository.find.mockResolvedValue([]);

      const result = await service.findAllByProject('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a test case by id', async () => {
      testCaseRepository.findOne.mockResolvedValue(mockTestCase);

      const result = await service.findById('proj-123', 'tc-123');

      expect(testCaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tc-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockTestCase);
    });

    it('should return null when test case not found', async () => {
      testCaseRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('proj-123', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a test case by id', async () => {
      testCaseRepository.findOne.mockResolvedValue(mockTestCase);

      const result = await service.findByIdOrFail('proj-123', 'tc-123');

      expect(result).toEqual(mockTestCase);
    });

    it('should throw NotFoundException when test case not found', async () => {
      testCaseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByIdOrFail('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByIdOrFail('proj-123', 'non-existent'),
      ).rejects.toThrow('Test case with ID non-existent not found');
    });
  });

  describe('update', () => {
    const updateTestCaseDto: UpdateTestCaseDto = {
      title: 'Updated Title',
      priority: Priority.CRITICAL,
    };

    it('should update an existing test case', async () => {
      const existingTestCase = { ...mockTestCase };
      const updatedTestCase = {
        ...existingTestCase,
        ...updateTestCaseDto,
        version: 2,
      };
      testCaseRepository.findOne.mockResolvedValue({ ...existingTestCase });
      testCaseRepository.save.mockResolvedValue(updatedTestCase);
      testCaseVersionRepository.create.mockReturnValue({
        ...mockTestCaseVersion,
        version: 2,
      });
      testCaseVersionRepository.save.mockResolvedValue({
        ...mockTestCaseVersion,
        version: 2,
      });

      const result = await service.update(
        'proj-123',
        'tc-123',
        updateTestCaseDto,
        'user-123',
      );

      expect(testCaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tc-123', projectId: 'proj-123' },
      });
      expect(testCaseRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
      expect(result.priority).toBe(Priority.CRITICAL);
      expect(result.version).toBe(2);
    });

    it('should increment version on update', async () => {
      const existingTestCase = { ...mockTestCase, version: 3 };
      const updatedTestCase = { ...existingTestCase, version: 4 };
      testCaseRepository.findOne.mockResolvedValue({ ...existingTestCase });
      testCaseRepository.save.mockResolvedValue(updatedTestCase);
      testCaseVersionRepository.create.mockReturnValue({
        ...mockTestCaseVersion,
        version: 4,
      });
      testCaseVersionRepository.save.mockResolvedValue({
        ...mockTestCaseVersion,
        version: 4,
      });

      const result = await service.update(
        'proj-123',
        'tc-123',
        updateTestCaseDto,
        'user-123',
      );

      expect(result.version).toBe(4);
    });

    it('should create a version snapshot when updating', async () => {
      const existingTestCase = { ...mockTestCase };
      const updatedTestCase = {
        ...existingTestCase,
        ...updateTestCaseDto,
        version: 2,
      };
      testCaseRepository.findOne.mockResolvedValue({ ...existingTestCase });
      testCaseRepository.save.mockResolvedValue(updatedTestCase);
      testCaseVersionRepository.create.mockReturnValue({
        ...mockTestCaseVersion,
        version: 2,
      });
      testCaseVersionRepository.save.mockResolvedValue({
        ...mockTestCaseVersion,
        version: 2,
      });

      await service.update('proj-123', 'tc-123', updateTestCaseDto, 'user-123');

      expect(testCaseVersionRepository.create).toHaveBeenCalledWith({
        testCaseId: updatedTestCase.id,
        version: 2,
        data: expect.objectContaining({
          title: updatedTestCase.title,
        }),
        changedBy: 'user-123',
      });
      expect(testCaseVersionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when test case not found', async () => {
      testCaseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-123', 'non-existent', updateTestCaseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update without userId', async () => {
      const existingTestCase = { ...mockTestCase };
      const updatedTestCase = {
        ...existingTestCase,
        ...updateTestCaseDto,
        version: 2,
      };
      testCaseRepository.findOne.mockResolvedValue({ ...existingTestCase });
      testCaseRepository.save.mockResolvedValue(updatedTestCase);
      testCaseVersionRepository.create.mockReturnValue({
        ...mockTestCaseVersion,
        version: 2,
        changedBy: undefined,
      });
      testCaseVersionRepository.save.mockResolvedValue({
        ...mockTestCaseVersion,
        version: 2,
        changedBy: undefined,
      });

      const result = await service.update('proj-123', 'tc-123', updateTestCaseDto);

      expect(result).toBeDefined();
      expect(testCaseVersionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          changedBy: undefined,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a test case', async () => {
      testCaseRepository.findOne.mockResolvedValue(mockTestCase);
      testCaseRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.delete('proj-123', 'tc-123');

      expect(testCaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tc-123', projectId: 'proj-123' },
      });
      expect(testCaseRepository.softDelete).toHaveBeenCalledWith('tc-123');
    });

    it('should throw NotFoundException when test case not found', async () => {
      testCaseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.delete('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHistory', () => {
    it('should return version history for a test case', async () => {
      const versions = [
        { ...mockTestCaseVersion, version: 2 },
        { ...mockTestCaseVersion, version: 1 },
      ];
      testCaseRepository.findOne.mockResolvedValue(mockTestCase);
      testCaseVersionRepository.find.mockResolvedValue(versions);

      const result = await service.getHistory('proj-123', 'tc-123');

      expect(testCaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tc-123', projectId: 'proj-123' },
      });
      expect(testCaseVersionRepository.find).toHaveBeenCalledWith({
        where: { testCaseId: 'tc-123' },
        order: { version: 'DESC' },
      });
      expect(result).toEqual(versions);
      expect(result[0].version).toBe(2);
    });

    it('should return empty array when no versions exist', async () => {
      testCaseRepository.findOne.mockResolvedValue(mockTestCase);
      testCaseVersionRepository.find.mockResolvedValue([]);

      const result = await service.getHistory('proj-123', 'tc-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when test case not found', async () => {
      testCaseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getHistory('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkCreate', () => {
    const createTestCaseDtos: CreateTestCaseDto[] = [
      { title: 'Test Case 1', priority: Priority.HIGH },
      { title: 'Test Case 2', priority: Priority.MEDIUM },
    ];

    it('should create multiple test cases', async () => {
      const createdTestCases = createTestCaseDtos.map((dto, index) => ({
        ...mockTestCase,
        id: `tc-${index + 1}`,
        ...dto,
        version: 1,
      }));
      testCaseRepository.create
        .mockReturnValueOnce(createdTestCases[0])
        .mockReturnValueOnce(createdTestCases[1]);
      testCaseRepository.save.mockResolvedValue(createdTestCases);
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      const result = await service.bulkCreate(
        'proj-123',
        createTestCaseDtos,
        'user-123',
      );

      expect(testCaseRepository.create).toHaveBeenCalledTimes(2);
      expect(testCaseRepository.save).toHaveBeenCalledWith(createdTestCases);
      expect(testCaseVersionRepository.save).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should create version snapshots for all created test cases', async () => {
      const createdTestCases = createTestCaseDtos.map((dto, index) => ({
        ...mockTestCase,
        id: `tc-${index + 1}`,
        ...dto,
        version: 1,
      }));
      testCaseRepository.create
        .mockReturnValueOnce(createdTestCases[0])
        .mockReturnValueOnce(createdTestCases[1]);
      testCaseRepository.save.mockResolvedValue(createdTestCases);
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      await service.bulkCreate('proj-123', createTestCaseDtos, 'user-123');

      expect(testCaseVersionRepository.create).toHaveBeenCalledTimes(2);
      expect(testCaseVersionRepository.save).toHaveBeenCalled();
    });

    it('should create test cases without userId', async () => {
      const createdTestCases = createTestCaseDtos.map((dto, index) => ({
        ...mockTestCase,
        id: `tc-${index + 1}`,
        ...dto,
        version: 1,
        createdBy: undefined,
      }));
      testCaseRepository.create
        .mockReturnValueOnce(createdTestCases[0])
        .mockReturnValueOnce(createdTestCases[1]);
      testCaseRepository.save.mockResolvedValue(createdTestCases);
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      const result = await service.bulkCreate('proj-123', createTestCaseDtos);

      expect(testCaseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: undefined,
        }),
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('bulkUpdate', () => {
    const updateItems = [
      { id: 'tc-1', title: 'Updated Title 1' },
      { id: 'tc-2', title: 'Updated Title 2' },
    ];

    it('should update multiple test cases', async () => {
      const existingTestCases = [
        { ...mockTestCase, id: 'tc-1', version: 1 },
        { ...mockTestCase, id: 'tc-2', version: 1 },
      ];
      const updatedTestCases = existingTestCases.map((tc, i) => ({
        ...tc,
        title: updateItems[i].title,
        version: 2,
      }));
      testCaseRepository.find.mockResolvedValue(
        existingTestCases.map((tc) => ({ ...tc })),
      );
      testCaseRepository.save.mockResolvedValue(updatedTestCases);
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      const result = await service.bulkUpdate(
        'proj-123',
        updateItems,
        'user-123',
      );

      expect(testCaseRepository.find).toHaveBeenCalled();
      expect(testCaseRepository.save).toHaveBeenCalled();
      expect(result.updated).toHaveLength(2);
      expect(result.notFound).toHaveLength(0);
    });

    it('should increment version for all updated test cases', async () => {
      const existingTestCases = [
        { ...mockTestCase, id: 'tc-1', version: 3 },
        { ...mockTestCase, id: 'tc-2', version: 5 },
      ];
      testCaseRepository.find.mockResolvedValue(
        existingTestCases.map((tc) => ({ ...tc })),
      );
      testCaseRepository.save.mockImplementation((testCases) =>
        Promise.resolve(testCases),
      );
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      const result = await service.bulkUpdate(
        'proj-123',
        updateItems,
        'user-123',
      );

      expect(result.updated[0].version).toBe(4);
      expect(result.updated[1].version).toBe(6);
    });

    it('should return notFound ids for non-existent test cases', async () => {
      const existingTestCases = [{ ...mockTestCase, id: 'tc-1', version: 1 }];
      testCaseRepository.find.mockResolvedValue(
        existingTestCases.map((tc) => ({ ...tc })),
      );
      testCaseRepository.save.mockImplementation((testCases) =>
        Promise.resolve(testCases),
      );
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      const result = await service.bulkUpdate(
        'proj-123',
        updateItems,
        'user-123',
      );

      expect(result.updated).toHaveLength(1);
      expect(result.notFound).toEqual(['tc-2']);
    });

    it('should return empty updated array when no test cases found', async () => {
      testCaseRepository.find.mockResolvedValue([]);

      const result = await service.bulkUpdate(
        'proj-123',
        updateItems,
        'user-123',
      );

      expect(result.updated).toHaveLength(0);
      expect(result.notFound).toEqual(['tc-1', 'tc-2']);
      expect(testCaseRepository.save).not.toHaveBeenCalled();
    });

    it('should create version snapshots for all updated test cases', async () => {
      const existingTestCases = [
        { ...mockTestCase, id: 'tc-1', version: 1 },
        { ...mockTestCase, id: 'tc-2', version: 1 },
      ];
      testCaseRepository.find.mockResolvedValue(
        existingTestCases.map((tc) => ({ ...tc })),
      );
      testCaseRepository.save.mockImplementation((testCases) =>
        Promise.resolve(testCases),
      );
      testCaseVersionRepository.create.mockReturnValue(mockTestCaseVersion);
      testCaseVersionRepository.save.mockResolvedValue([mockTestCaseVersion]);

      await service.bulkUpdate('proj-123', updateItems, 'user-123');

      expect(testCaseVersionRepository.create).toHaveBeenCalledTimes(2);
      expect(testCaseVersionRepository.save).toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    const idsToDelete = ['tc-1', 'tc-2'];

    it('should soft delete multiple test cases', async () => {
      const existingTestCases = [
        { ...mockTestCase, id: 'tc-1' },
        { ...mockTestCase, id: 'tc-2' },
      ];
      testCaseRepository.find.mockResolvedValue(existingTestCases);
      testCaseRepository.softDelete.mockResolvedValue({ affected: 2 } as any);

      const result = await service.bulkDelete('proj-123', idsToDelete);

      expect(testCaseRepository.find).toHaveBeenCalled();
      expect(testCaseRepository.softDelete).toHaveBeenCalledWith([
        'tc-1',
        'tc-2',
      ]);
      expect(result.deleted).toEqual(['tc-1', 'tc-2']);
      expect(result.notFound).toHaveLength(0);
    });

    it('should return notFound ids for non-existent test cases', async () => {
      const existingTestCases = [{ ...mockTestCase, id: 'tc-1' }];
      testCaseRepository.find.mockResolvedValue(existingTestCases);
      testCaseRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.bulkDelete('proj-123', idsToDelete);

      expect(result.deleted).toEqual(['tc-1']);
      expect(result.notFound).toEqual(['tc-2']);
    });

    it('should return empty deleted array when no test cases found', async () => {
      testCaseRepository.find.mockResolvedValue([]);

      const result = await service.bulkDelete('proj-123', idsToDelete);

      expect(result.deleted).toHaveLength(0);
      expect(result.notFound).toEqual(['tc-1', 'tc-2']);
      expect(testCaseRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should only delete test cases belonging to the project', async () => {
      const existingTestCases = [{ ...mockTestCase, id: 'tc-1' }];
      testCaseRepository.find.mockResolvedValue(existingTestCases);
      testCaseRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.bulkDelete('proj-123', idsToDelete);

      expect(testCaseRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything(), projectId: 'proj-123' },
      });
    });
  });
});
