import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TestSuitesService } from './test-suites.service';
import { TestSuite } from './entities/test-suite.entity';
import { Section } from './entities/section.entity';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

describe('TestSuitesService', () => {
  let service: TestSuitesService;
  let testSuiteRepository: jest.Mocked<Repository<TestSuite>>;
  let sectionRepository: jest.Mocked<Repository<Section>>;

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
      providers: [
        TestSuitesService,
        {
          provide: getRepositoryToken(TestSuite),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Section),
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

    service = module.get<TestSuitesService>(TestSuitesService);
    testSuiteRepository = module.get(getRepositoryToken(TestSuite));
    sectionRepository = module.get(getRepositoryToken(Section));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTestSuiteDto: CreateTestSuiteDto = {
      name: 'New Suite',
      description: 'A new test suite',
    };

    it('should create a new test suite', async () => {
      const newSuite = { ...mockTestSuite, ...createTestSuiteDto };
      testSuiteRepository.create.mockReturnValue(newSuite);
      testSuiteRepository.save.mockResolvedValue(newSuite);

      const result = await service.create('proj-123', createTestSuiteDto);

      expect(testSuiteRepository.create).toHaveBeenCalledWith({
        projectId: 'proj-123',
        ...createTestSuiteDto,
      });
      expect(testSuiteRepository.save).toHaveBeenCalledWith(newSuite);
      expect(result).toEqual(newSuite);
    });

    it('should create a test suite without description', async () => {
      const dtoWithoutDescription: CreateTestSuiteDto = {
        name: 'Suite Without Description',
      };
      const newSuite = { ...mockTestSuite, ...dtoWithoutDescription, description: undefined };
      testSuiteRepository.create.mockReturnValue(newSuite);
      testSuiteRepository.save.mockResolvedValue(newSuite);

      const result = await service.create('proj-123', dtoWithoutDescription);

      expect(testSuiteRepository.create).toHaveBeenCalledWith({
        projectId: 'proj-123',
        ...dtoWithoutDescription,
      });
      expect(result).toEqual(newSuite);
    });
  });

  describe('findAllByProject', () => {
    it('should return all test suites for a project', async () => {
      const suites = [mockTestSuite];
      testSuiteRepository.find.mockResolvedValue(suites);

      const result = await service.findAllByProject('proj-123');

      expect(testSuiteRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(suites);
    });

    it('should return empty array when no suites exist', async () => {
      testSuiteRepository.find.mockResolvedValue([]);

      const result = await service.findAllByProject('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a test suite by id', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);

      const result = await service.findById('proj-123', 'suite-123');

      expect(testSuiteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'suite-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockTestSuite);
    });

    it('should return null when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('proj-123', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a test suite by id', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);

      const result = await service.findByIdOrFail('proj-123', 'suite-123');

      expect(result).toEqual(mockTestSuite);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByIdOrFail('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByIdOrFail('proj-123', 'non-existent'),
      ).rejects.toThrow('Test suite with ID non-existent not found');
    });
  });

  describe('update', () => {
    const updateTestSuiteDto: UpdateTestSuiteDto = {
      name: 'Updated Suite',
    };

    it('should update an existing test suite', async () => {
      const updatedSuite = { ...mockTestSuite, ...updateTestSuiteDto };
      testSuiteRepository.findOne.mockResolvedValue({ ...mockTestSuite });
      testSuiteRepository.save.mockResolvedValue(updatedSuite);

      const result = await service.update('proj-123', 'suite-123', updateTestSuiteDto);

      expect(testSuiteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'suite-123', projectId: 'proj-123' },
      });
      expect(testSuiteRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'suite-123',
          name: 'Updated Suite',
        }),
      );
      expect(result).toEqual(updatedSuite);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-123', 'non-existent', updateTestSuiteDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateTestSuiteDto = {
        description: 'Updated description',
      };
      const existingSuite = { ...mockTestSuite };
      const updatedSuite = { ...mockTestSuite, description: 'Updated description' };

      testSuiteRepository.findOne.mockResolvedValue(existingSuite);
      testSuiteRepository.save.mockResolvedValue(updatedSuite);

      const result = await service.update('proj-123', 'suite-123', partialUpdate);

      expect(testSuiteRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'suite-123',
          name: 'Login Test Suite',
          description: 'Updated description',
        }),
      );
      expect(result.description).toBe('Updated description');
    });
  });

  describe('delete', () => {
    it('should delete an existing test suite', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      testSuiteRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.delete('proj-123', 'suite-123');

      expect(testSuiteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'suite-123', projectId: 'proj-123' },
      });
      expect(testSuiteRepository.delete).toHaveBeenCalledWith('suite-123');
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(testSuiteRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('createSection', () => {
    const createSectionDto: CreateSectionDto = {
      name: 'New Section',
      position: 0,
    };

    it('should create a new section', async () => {
      const newSection = { ...mockSection, ...createSectionDto };
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.create.mockReturnValue(newSection);
      sectionRepository.save.mockResolvedValue(newSection);

      const result = await service.createSection(
        'proj-123',
        'suite-123',
        createSectionDto,
      );

      expect(testSuiteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'suite-123', projectId: 'proj-123' },
      });
      expect(sectionRepository.create).toHaveBeenCalledWith({
        suiteId: 'suite-123',
        ...createSectionDto,
      });
      expect(sectionRepository.save).toHaveBeenCalledWith(newSection);
      expect(result).toEqual(newSection);
    });

    it('should create a section with parent', async () => {
      const parentSection = { ...mockSection, id: 'parent-123' };
      const createSectionWithParentDto: CreateSectionDto = {
        name: 'Child Section',
        parentId: 'parent-123',
        position: 0,
      };
      const newSection = { ...mockSection, ...createSectionWithParentDto };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(parentSection);
      sectionRepository.create.mockReturnValue(newSection);
      sectionRepository.save.mockResolvedValue(newSection);

      const result = await service.createSection(
        'proj-123',
        'suite-123',
        createSectionWithParentDto,
      );

      expect(sectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'parent-123', suiteId: 'suite-123' },
      });
      expect(result).toEqual(newSection);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSection('proj-123', 'non-existent', createSectionDto),
      ).rejects.toThrow(NotFoundException);
      expect(sectionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when parent section not found', async () => {
      const createSectionWithInvalidParentDto: CreateSectionDto = {
        name: 'Child Section',
        parentId: 'invalid-parent',
        position: 0,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSection(
          'proj-123',
          'suite-123',
          createSectionWithInvalidParentDto,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createSection(
          'proj-123',
          'suite-123',
          createSectionWithInvalidParentDto,
        ),
      ).rejects.toThrow(
        'Parent section with ID invalid-parent not found in suite suite-123',
      );
    });

    it('should use default position when not provided', async () => {
      const createSectionWithoutPosition: CreateSectionDto = {
        name: 'Section Without Position',
      };
      const newSection = { ...mockSection, ...createSectionWithoutPosition, position: 0 };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.create.mockReturnValue(newSection);
      sectionRepository.save.mockResolvedValue(newSection);

      await service.createSection('proj-123', 'suite-123', createSectionWithoutPosition);

      expect(sectionRepository.create).toHaveBeenCalledWith({
        suiteId: 'suite-123',
        name: 'Section Without Position',
        position: 0,
      });
    });
  });

  describe('findSectionsBySuite', () => {
    it('should return all sections for a suite', async () => {
      const sections = [mockSection];
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue(sections);

      const result = await service.findSectionsBySuite('proj-123', 'suite-123');

      expect(testSuiteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'suite-123', projectId: 'proj-123' },
      });
      expect(sectionRepository.find).toHaveBeenCalledWith({
        where: { suiteId: 'suite-123' },
        order: { position: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(sections);
    });

    it('should return empty array when no sections exist', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue([]);

      const result = await service.findSectionsBySuite('proj-123', 'suite-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findSectionsBySuite('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      expect(sectionRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('findSectionById', () => {
    it('should find a section by id', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(mockSection);

      const result = await service.findSectionById(
        'proj-123',
        'suite-123',
        'section-123',
      );

      expect(sectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'section-123', suiteId: 'suite-123' },
      });
      expect(result).toEqual(mockSection);
    });

    it('should return null when section not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      const result = await service.findSectionById(
        'proj-123',
        'suite-123',
        'non-existent',
      );

      expect(result).toBeNull();
    });
  });

  describe('findSectionByIdOrFail', () => {
    it('should find a section by id', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(mockSection);

      const result = await service.findSectionByIdOrFail(
        'proj-123',
        'suite-123',
        'section-123',
      );

      expect(result).toEqual(mockSection);
    });

    it('should throw NotFoundException when section not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findSectionByIdOrFail('proj-123', 'suite-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findSectionByIdOrFail('proj-123', 'suite-123', 'non-existent'),
      ).rejects.toThrow('Section with ID non-existent not found');
    });
  });

  describe('updateSection', () => {
    const updateSectionDto: UpdateSectionDto = {
      name: 'Updated Section',
    };

    it('should update an existing section', async () => {
      const updatedSection = { ...mockSection, ...updateSectionDto };
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue({ ...mockSection });
      sectionRepository.save.mockResolvedValue(updatedSection);

      const result = await service.updateSection(
        'proj-123',
        'suite-123',
        'section-123',
        updateSectionDto,
      );

      expect(sectionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'section-123',
          name: 'Updated Section',
        }),
      );
      expect(result).toEqual(updatedSection);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSection('proj-123', 'non-existent', 'section-123', updateSectionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when section not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSection('proj-123', 'suite-123', 'non-existent', updateSectionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update section parent', async () => {
      const parentSection = { ...mockSection, id: 'parent-123', name: 'Parent' };
      const updateWithParentDto: UpdateSectionDto = {
        parentId: 'parent-123',
      };
      const updatedSection = { ...mockSection, parentId: 'parent-123' };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne
        .mockResolvedValueOnce({ ...mockSection })
        .mockResolvedValueOnce(parentSection);
      sectionRepository.save.mockResolvedValue(updatedSection);

      const result = await service.updateSection(
        'proj-123',
        'suite-123',
        'section-123',
        updateWithParentDto,
      );

      expect(result.parentId).toBe('parent-123');
    });

    it('should throw error when trying to set section as its own parent', async () => {
      const updateWithSelfParentDto: UpdateSectionDto = {
        parentId: 'section-123',
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue({ ...mockSection });

      await expect(
        service.updateSection(
          'proj-123',
          'suite-123',
          'section-123',
          updateWithSelfParentDto,
        ),
      ).rejects.toThrow('A section cannot be its own parent');
    });

    it('should throw NotFoundException when new parent not found', async () => {
      const updateWithInvalidParentDto: UpdateSectionDto = {
        parentId: 'invalid-parent',
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne
        .mockResolvedValueOnce({ ...mockSection })
        .mockResolvedValueOnce(null);

      await expect(
        service.updateSection(
          'proj-123',
          'suite-123',
          'section-123',
          updateWithInvalidParentDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSection', () => {
    it('should delete an existing section', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(mockSection);
      sectionRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteSection('proj-123', 'suite-123', 'section-123');

      expect(sectionRepository.delete).toHaveBeenCalledWith('section-123');
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteSection('proj-123', 'non-existent', 'section-123'),
      ).rejects.toThrow(NotFoundException);
      expect(sectionRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when section not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteSection('proj-123', 'suite-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      expect(sectionRepository.delete).not.toHaveBeenCalled();
    });
  });
});
