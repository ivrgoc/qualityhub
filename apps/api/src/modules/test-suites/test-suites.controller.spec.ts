import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TestSuitesController } from './test-suites.controller';
import { TestSuitesService } from './test-suites.service';
import { TestSuite } from './entities/test-suite.entity';
import { Section } from './entities/section.entity';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

describe('TestSuitesController', () => {
  let controller: TestSuitesController;
  let service: jest.Mocked<TestSuitesService>;

  const mockTestSuite: TestSuite = {
    id: 'suite-123',
    projectId: 'proj-123',
    project: null,
    name: 'Login Test Suite',
    description: 'Test suite for login functionality',
    createdAt: new Date('2024-01-01'),
    sections: [],
  };

  const mockSection: Section = {
    id: 'section-123',
    suiteId: 'suite-123',
    suite: null,
    name: 'Authentication Tests',
    parentId: null,
    parent: null,
    children: [],
    position: 0,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestSuitesController],
      providers: [
        {
          provide: TestSuitesService,
          useValue: {
            create: jest.fn(),
            findAllByProject: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createSection: jest.fn(),
            findSectionsBySuite: jest.fn(),
            findSectionByIdOrFail: jest.fn(),
            updateSection: jest.fn(),
            deleteSection: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestSuitesController>(TestSuitesController);
    service = module.get(TestSuitesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTestSuiteDto: CreateTestSuiteDto = {
      name: 'New Suite',
      description: 'A new test suite',
    };

    it('should create a new test suite', async () => {
      const newSuite = { ...mockTestSuite, ...createTestSuiteDto };
      service.create.mockResolvedValue(newSuite);

      const result = await controller.create('proj-123', createTestSuiteDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', createTestSuiteDto);
      expect(result).toEqual(newSuite);
    });
  });

  describe('findAll', () => {
    it('should return all test suites for a project', async () => {
      const suites = [mockTestSuite];
      service.findAllByProject.mockResolvedValue(suites);

      const result = await controller.findAll('proj-123');

      expect(service.findAllByProject).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(suites);
    });

    it('should return empty array when no suites exist', async () => {
      service.findAllByProject.mockResolvedValue([]);

      const result = await controller.findAll('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a test suite by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockTestSuite);

      const result = await controller.findById('proj-123', 'suite-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123', 'suite-123');
      expect(result).toEqual(mockTestSuite);
    });

    it('should throw NotFoundException when suite not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Test suite with ID non-existent not found'),
      );

      await expect(controller.findById('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateTestSuiteDto: UpdateTestSuiteDto = {
      name: 'Updated Suite',
    };

    it('should update a test suite', async () => {
      const updatedSuite = { ...mockTestSuite, ...updateTestSuiteDto };
      service.update.mockResolvedValue(updatedSuite);

      const result = await controller.update('proj-123', 'suite-123', updateTestSuiteDto);

      expect(service.update).toHaveBeenCalledWith(
        'proj-123',
        'suite-123',
        updateTestSuiteDto,
      );
      expect(result).toEqual(updatedSuite);
    });

    it('should throw NotFoundException when suite not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Test suite with ID non-existent not found'),
      );

      await expect(
        controller.update('proj-123', 'non-existent', updateTestSuiteDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a test suite', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123', 'suite-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123', 'suite-123');
    });

    it('should throw NotFoundException when suite not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Test suite with ID non-existent not found'),
      );

      await expect(controller.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createSection', () => {
    const createSectionDto: CreateSectionDto = {
      name: 'New Section',
      position: 0,
    };

    it('should create a new section', async () => {
      const newSection = { ...mockSection, ...createSectionDto };
      service.createSection.mockResolvedValue(newSection);

      const result = await controller.createSection(
        'proj-123',
        'suite-123',
        createSectionDto,
      );

      expect(service.createSection).toHaveBeenCalledWith(
        'proj-123',
        'suite-123',
        createSectionDto,
      );
      expect(result).toEqual(newSection);
    });

    it('should throw NotFoundException when suite not found', async () => {
      service.createSection.mockRejectedValue(
        new NotFoundException('Test suite with ID non-existent not found'),
      );

      await expect(
        controller.createSection('proj-123', 'non-existent', createSectionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSections', () => {
    it('should return all sections for a suite', async () => {
      const sections = [mockSection];
      service.findSectionsBySuite.mockResolvedValue(sections);

      const result = await controller.findSections('proj-123', 'suite-123');

      expect(service.findSectionsBySuite).toHaveBeenCalledWith('proj-123', 'suite-123');
      expect(result).toEqual(sections);
    });

    it('should return empty array when no sections exist', async () => {
      service.findSectionsBySuite.mockResolvedValue([]);

      const result = await controller.findSections('proj-123', 'suite-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when suite not found', async () => {
      service.findSectionsBySuite.mockRejectedValue(
        new NotFoundException('Test suite with ID non-existent not found'),
      );

      await expect(
        controller.findSections('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSectionById', () => {
    it('should return a section by id', async () => {
      service.findSectionByIdOrFail.mockResolvedValue(mockSection);

      const result = await controller.findSectionById(
        'proj-123',
        'suite-123',
        'section-123',
      );

      expect(service.findSectionByIdOrFail).toHaveBeenCalledWith(
        'proj-123',
        'suite-123',
        'section-123',
      );
      expect(result).toEqual(mockSection);
    });

    it('should throw NotFoundException when section not found', async () => {
      service.findSectionByIdOrFail.mockRejectedValue(
        new NotFoundException('Section with ID non-existent not found'),
      );

      await expect(
        controller.findSectionById('proj-123', 'suite-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSection', () => {
    const updateSectionDto: UpdateSectionDto = {
      name: 'Updated Section',
    };

    it('should update a section', async () => {
      const updatedSection = { ...mockSection, ...updateSectionDto };
      service.updateSection.mockResolvedValue(updatedSection);

      const result = await controller.updateSection(
        'proj-123',
        'suite-123',
        'section-123',
        updateSectionDto,
      );

      expect(service.updateSection).toHaveBeenCalledWith(
        'proj-123',
        'suite-123',
        'section-123',
        updateSectionDto,
      );
      expect(result).toEqual(updatedSection);
    });

    it('should throw NotFoundException when section not found', async () => {
      service.updateSection.mockRejectedValue(
        new NotFoundException('Section with ID non-existent not found'),
      );

      await expect(
        controller.updateSection(
          'proj-123',
          'suite-123',
          'non-existent',
          updateSectionDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSection', () => {
    it('should delete a section', async () => {
      service.deleteSection.mockResolvedValue(undefined);

      await controller.deleteSection('proj-123', 'suite-123', 'section-123');

      expect(service.deleteSection).toHaveBeenCalledWith(
        'proj-123',
        'suite-123',
        'section-123',
      );
    });

    it('should throw NotFoundException when section not found', async () => {
      service.deleteSection.mockRejectedValue(
        new NotFoundException('Section with ID non-existent not found'),
      );

      await expect(
        controller.deleteSection('proj-123', 'suite-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
