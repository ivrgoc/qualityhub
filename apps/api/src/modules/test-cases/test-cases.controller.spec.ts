import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TestCasesController } from './test-cases.controller';
import { TestCasesService } from './test-cases.service';
import { TestCase, TestCaseTemplate, Priority } from './entities/test-case.entity';
import { TestCaseVersion } from './entities/test-case-version.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { BulkCreateTestCasesDto } from './dto/bulk-create-test-cases.dto';
import { BulkUpdateTestCasesDto } from './dto/bulk-update-test-cases.dto';
import { BulkDeleteTestCasesDto } from './dto/bulk-delete-test-cases.dto';
import { User } from '../users/entities/user.entity';

describe('TestCasesController', () => {
  let controller: TestCasesController;
  let service: jest.Mocked<TestCasesService>;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
  };

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
      controllers: [TestCasesController],
      providers: [
        {
          provide: TestCasesService,
          useValue: {
            create: jest.fn(),
            findAllByProject: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getHistory: jest.fn(),
            bulkCreate: jest.fn(),
            bulkUpdate: jest.fn(),
            bulkDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestCasesController>(TestCasesController);
    service = module.get(TestCasesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTestCaseDto: CreateTestCaseDto = {
      title: 'Login with valid credentials',
      templateType: TestCaseTemplate.STEPS,
      priority: Priority.HIGH,
    };

    it('should create a new test case', async () => {
      const newTestCase = { ...mockTestCase, ...createTestCaseDto };
      service.create.mockResolvedValue(newTestCase);

      const result = await controller.create(
        'proj-123',
        createTestCaseDto,
        mockUser as User,
      );

      expect(service.create).toHaveBeenCalledWith(
        'proj-123',
        createTestCaseDto,
        'user-123',
      );
      expect(result).toEqual(newTestCase);
    });

    it('should create a test case with undefined user', async () => {
      service.create.mockResolvedValue(mockTestCase);

      const result = await controller.create(
        'proj-123',
        createTestCaseDto,
        undefined as any,
      );

      expect(service.create).toHaveBeenCalledWith(
        'proj-123',
        createTestCaseDto,
        undefined,
      );
      expect(result).toEqual(mockTestCase);
    });
  });

  describe('findAll', () => {
    it('should return all test cases for a project', async () => {
      const testCases = [mockTestCase];
      service.findAllByProject.mockResolvedValue(testCases);

      const result = await controller.findAll('proj-123');

      expect(service.findAllByProject).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(testCases);
    });

    it('should return empty array when no test cases exist', async () => {
      service.findAllByProject.mockResolvedValue([]);

      const result = await controller.findAll('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a test case by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockTestCase);

      const result = await controller.findById('proj-123', 'tc-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123', 'tc-123');
      expect(result).toEqual(mockTestCase);
    });

    it('should throw NotFoundException when test case not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Test case with ID non-existent not found'),
      );

      await expect(controller.findById('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateTestCaseDto: UpdateTestCaseDto = {
      title: 'Updated Title',
      priority: Priority.CRITICAL,
    };

    it('should update a test case', async () => {
      const updatedTestCase = {
        ...mockTestCase,
        ...updateTestCaseDto,
        version: 2,
      };
      service.update.mockResolvedValue(updatedTestCase);

      const result = await controller.update(
        'proj-123',
        'tc-123',
        updateTestCaseDto,
        mockUser as User,
      );

      expect(service.update).toHaveBeenCalledWith(
        'proj-123',
        'tc-123',
        updateTestCaseDto,
        'user-123',
      );
      expect(result).toEqual(updatedTestCase);
      expect(result.version).toBe(2);
    });

    it('should update a test case with undefined user', async () => {
      const updatedTestCase = {
        ...mockTestCase,
        ...updateTestCaseDto,
        version: 2,
      };
      service.update.mockResolvedValue(updatedTestCase);

      const result = await controller.update(
        'proj-123',
        'tc-123',
        updateTestCaseDto,
        undefined as any,
      );

      expect(service.update).toHaveBeenCalledWith(
        'proj-123',
        'tc-123',
        updateTestCaseDto,
        undefined,
      );
      expect(result).toEqual(updatedTestCase);
    });

    it('should throw NotFoundException when test case not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Test case with ID non-existent not found'),
      );

      await expect(
        controller.update(
          'proj-123',
          'non-existent',
          updateTestCaseDto,
          mockUser as User,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a test case', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123', 'tc-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123', 'tc-123');
    });

    it('should throw NotFoundException when test case not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Test case with ID non-existent not found'),
      );

      await expect(controller.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getHistory', () => {
    it('should return version history for a test case', async () => {
      const versions = [
        { ...mockTestCaseVersion, version: 2 },
        { ...mockTestCaseVersion, version: 1 },
      ];
      service.getHistory.mockResolvedValue(versions);

      const result = await controller.getHistory('proj-123', 'tc-123');

      expect(service.getHistory).toHaveBeenCalledWith('proj-123', 'tc-123');
      expect(result).toEqual(versions);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no versions exist', async () => {
      service.getHistory.mockResolvedValue([]);

      const result = await controller.getHistory('proj-123', 'tc-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when test case not found', async () => {
      service.getHistory.mockRejectedValue(
        new NotFoundException('Test case with ID non-existent not found'),
      );

      await expect(controller.getHistory('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulkCreate', () => {
    const bulkCreateDto: BulkCreateTestCasesDto = {
      testCases: [
        { title: 'Test Case 1', templateType: TestCaseTemplate.STEPS, priority: Priority.HIGH },
        { title: 'Test Case 2', templateType: TestCaseTemplate.TEXT, priority: Priority.MEDIUM },
      ],
    };

    it('should bulk create test cases', async () => {
      const createdTestCases = [
        { ...mockTestCase, id: 'tc-1', title: 'Test Case 1' },
        { ...mockTestCase, id: 'tc-2', title: 'Test Case 2' },
      ];
      service.bulkCreate.mockResolvedValue(createdTestCases);

      const result = await controller.bulkCreate(
        'proj-123',
        bulkCreateDto,
        mockUser as User,
      );

      expect(service.bulkCreate).toHaveBeenCalledWith(
        'proj-123',
        bulkCreateDto.testCases,
        'user-123',
      );
      expect(result).toEqual(createdTestCases);
      expect(result).toHaveLength(2);
    });

    it('should bulk create test cases with undefined user', async () => {
      const createdTestCases = [
        { ...mockTestCase, id: 'tc-1', title: 'Test Case 1' },
      ];
      service.bulkCreate.mockResolvedValue(createdTestCases);

      const singleItemDto: BulkCreateTestCasesDto = {
        testCases: [bulkCreateDto.testCases[0]],
      };

      const result = await controller.bulkCreate(
        'proj-123',
        singleItemDto,
        undefined as any,
      );

      expect(service.bulkCreate).toHaveBeenCalledWith(
        'proj-123',
        singleItemDto.testCases,
        undefined,
      );
      expect(result).toEqual(createdTestCases);
    });
  });

  describe('bulkUpdate', () => {
    const bulkUpdateDto: BulkUpdateTestCasesDto = {
      testCases: [
        { id: 'tc-1', title: 'Updated Title 1' },
        { id: 'tc-2', title: 'Updated Title 2' },
      ],
    };

    it('should bulk update test cases', async () => {
      const updateResult = {
        updated: [
          { ...mockTestCase, id: 'tc-1', title: 'Updated Title 1', version: 2 },
          { ...mockTestCase, id: 'tc-2', title: 'Updated Title 2', version: 2 },
        ],
        notFound: [],
      };
      service.bulkUpdate.mockResolvedValue(updateResult);

      const result = await controller.bulkUpdate(
        'proj-123',
        bulkUpdateDto,
        mockUser as User,
      );

      expect(service.bulkUpdate).toHaveBeenCalledWith(
        'proj-123',
        bulkUpdateDto.testCases,
        'user-123',
      );
      expect(result).toEqual(updateResult);
      expect(result.updated).toHaveLength(2);
      expect(result.notFound).toHaveLength(0);
    });

    it('should bulk update test cases with undefined user', async () => {
      const updateResult = {
        updated: [{ ...mockTestCase, id: 'tc-1', title: 'Updated Title 1', version: 2 }],
        notFound: [],
      };
      service.bulkUpdate.mockResolvedValue(updateResult);

      const singleItemDto: BulkUpdateTestCasesDto = {
        testCases: [bulkUpdateDto.testCases[0]],
      };

      const result = await controller.bulkUpdate(
        'proj-123',
        singleItemDto,
        undefined as any,
      );

      expect(service.bulkUpdate).toHaveBeenCalledWith(
        'proj-123',
        singleItemDto.testCases,
        undefined,
      );
      expect(result).toEqual(updateResult);
    });

    it('should return not found ids when some test cases do not exist', async () => {
      const updateResult = {
        updated: [{ ...mockTestCase, id: 'tc-1', title: 'Updated Title 1', version: 2 }],
        notFound: ['tc-2'],
      };
      service.bulkUpdate.mockResolvedValue(updateResult);

      const result = await controller.bulkUpdate(
        'proj-123',
        bulkUpdateDto,
        mockUser as User,
      );

      expect(result.updated).toHaveLength(1);
      expect(result.notFound).toEqual(['tc-2']);
    });
  });

  describe('bulkDelete', () => {
    const bulkDeleteDto: BulkDeleteTestCasesDto = {
      ids: ['tc-1', 'tc-2'],
    };

    it('should bulk delete test cases', async () => {
      const deleteResult = {
        deleted: ['tc-1', 'tc-2'],
        notFound: [],
      };
      service.bulkDelete.mockResolvedValue(deleteResult);

      const result = await controller.bulkDelete('proj-123', bulkDeleteDto);

      expect(service.bulkDelete).toHaveBeenCalledWith('proj-123', bulkDeleteDto.ids);
      expect(result).toEqual(deleteResult);
      expect(result.deleted).toHaveLength(2);
      expect(result.notFound).toHaveLength(0);
    });

    it('should return not found ids when some test cases do not exist', async () => {
      const deleteResult = {
        deleted: ['tc-1'],
        notFound: ['tc-2'],
      };
      service.bulkDelete.mockResolvedValue(deleteResult);

      const result = await controller.bulkDelete('proj-123', bulkDeleteDto);

      expect(result.deleted).toEqual(['tc-1']);
      expect(result.notFound).toEqual(['tc-2']);
    });

    it('should return all not found when no test cases exist', async () => {
      const deleteResult = {
        deleted: [],
        notFound: ['tc-1', 'tc-2'],
      };
      service.bulkDelete.mockResolvedValue(deleteResult);

      const result = await controller.bulkDelete('proj-123', bulkDeleteDto);

      expect(result.deleted).toHaveLength(0);
      expect(result.notFound).toEqual(['tc-1', 'tc-2']);
    });
  });
});
