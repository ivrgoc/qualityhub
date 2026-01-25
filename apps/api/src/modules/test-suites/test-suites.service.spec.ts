import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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
    testCases: [],
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

  describe('getSectionTree', () => {
    const rootSection: Section = {
      id: 'root-1',
      suiteId: 'suite-123',
      suite: null,
      name: 'Root Section',
      parentId: null,
      parent: null,
      children: [],
      position: 0,
      createdAt: new Date('2024-01-01'),
      testCases: [],
    };

    const childSection: Section = {
      id: 'child-1',
      suiteId: 'suite-123',
      suite: null,
      name: 'Child Section',
      parentId: 'root-1',
      parent: null,
      children: [],
      position: 0,
      createdAt: new Date('2024-01-01'),
      testCases: [],
    };

    const grandchildSection: Section = {
      id: 'grandchild-1',
      suiteId: 'suite-123',
      suite: null,
      name: 'Grandchild Section',
      parentId: 'child-1',
      parent: null,
      children: [],
      position: 0,
      createdAt: new Date('2024-01-01'),
      testCases: [],
    };

    it('should build a tree from flat sections', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue([
        rootSection,
        childSection,
        grandchildSection,
      ]);

      const result = await service.getSectionTree('proj-123', 'suite-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('root-1');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe('child-1');
      expect(result[0].children[0].children).toHaveLength(1);
      expect(result[0].children[0].children[0].id).toBe('grandchild-1');
    });

    it('should return empty array when no sections exist', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue([]);

      const result = await service.getSectionTree('proj-123', 'suite-123');

      expect(result).toEqual([]);
    });

    it('should handle multiple root sections', async () => {
      const secondRootSection: Section = {
        ...rootSection,
        id: 'root-2',
        name: 'Second Root',
        position: 1,
      };
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue([rootSection, secondRootSection]);

      const result = await service.getSectionTree('proj-123', 'suite-123');

      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getSectionTree('proj-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSectionChildren', () => {
    it('should return direct children of a section', async () => {
      const childSections = [
        { ...mockSection, id: 'child-1', parentId: 'section-123' },
        { ...mockSection, id: 'child-2', parentId: 'section-123' },
      ];
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue(childSections);

      const result = await service.getSectionChildren(
        'proj-123',
        'suite-123',
        'section-123',
      );

      expect(result).toEqual(childSections);
      expect(sectionRepository.find).toHaveBeenCalledWith({
        where: { suiteId: 'suite-123', parentId: 'section-123' },
        order: { position: 'ASC', createdAt: 'ASC' },
      });
    });

    it('should return root sections when parentId is null', async () => {
      const rootSections = [
        { ...mockSection, id: 'root-1', parentId: null },
        { ...mockSection, id: 'root-2', parentId: null },
      ];
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.find.mockResolvedValue(rootSections);

      const result = await service.getSectionChildren('proj-123', 'suite-123', null);

      expect(result).toEqual(rootSections);
    });

    it('should throw NotFoundException when suite not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getSectionChildren('proj-123', 'non-existent', 'section-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSectionAncestors', () => {
    it('should return all ancestors in order from root to parent', async () => {
      const grandparent: Section = {
        ...mockSection,
        id: 'grandparent',
        parentId: null,
      };
      const parent: Section = {
        ...mockSection,
        id: 'parent',
        parentId: 'grandparent',
      };
      const child: Section = {
        ...mockSection,
        id: 'child',
        parentId: 'parent',
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne
        .mockResolvedValueOnce(child)
        .mockResolvedValueOnce(parent)
        .mockResolvedValueOnce(grandparent);

      const result = await service.getSectionAncestors(
        'proj-123',
        'suite-123',
        'child',
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('grandparent');
      expect(result[1].id).toBe('parent');
    });

    it('should return empty array for root section', async () => {
      const rootSection: Section = {
        ...mockSection,
        id: 'root',
        parentId: null,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValueOnce(rootSection);

      const result = await service.getSectionAncestors(
        'proj-123',
        'suite-123',
        'root',
      );

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when section not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getSectionAncestors('proj-123', 'suite-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('moveSection', () => {
    it('should move section to new parent', async () => {
      const section: Section = {
        ...mockSection,
        id: 'section-to-move',
        parentId: null,
        position: 0,
      };
      const targetParent: Section = {
        ...mockSection,
        id: 'new-parent',
        parentId: null,
        position: 1,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne
        .mockResolvedValueOnce(section)
        .mockResolvedValueOnce(targetParent);
      sectionRepository.find.mockResolvedValue([]);
      sectionRepository.save.mockResolvedValue({
        ...section,
        parentId: 'new-parent',
        position: 0,
      });

      const result = await service.moveSection(
        'proj-123',
        'suite-123',
        'section-to-move',
        'new-parent',
        0,
      );

      expect(result.parentId).toBe('new-parent');
      expect(result.position).toBe(0);
    });

    it('should move section to root level', async () => {
      const section: Section = {
        ...mockSection,
        id: 'section-to-move',
        parentId: 'old-parent',
        position: 0,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValueOnce(section);
      sectionRepository.find.mockResolvedValue([]);
      sectionRepository.save.mockResolvedValue({
        ...section,
        parentId: null,
        position: 0,
      });

      const result = await service.moveSection(
        'proj-123',
        'suite-123',
        'section-to-move',
        null,
        0,
      );

      expect(result.parentId).toBeNull();
    });

    it('should reorder siblings when moving section', async () => {
      const section: Section = {
        ...mockSection,
        id: 'section-to-move',
        parentId: null,
        position: 2,
      };
      const sibling1: Section = {
        ...mockSection,
        id: 'sibling-1',
        parentId: null,
        position: 0,
      };
      const sibling2: Section = {
        ...mockSection,
        id: 'sibling-2',
        parentId: null,
        position: 1,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValueOnce(section);
      sectionRepository.find.mockResolvedValue([sibling1, sibling2, section]);
      sectionRepository.save.mockImplementation((s) => Promise.resolve(s));

      await service.moveSection(
        'proj-123',
        'suite-123',
        'section-to-move',
        null,
        1,
      );

      expect(sectionRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to set section as its own parent', async () => {
      const section: Section = {
        ...mockSection,
        id: 'section-123',
        parentId: null,
        position: 0,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(section);

      await expect(
        service.moveSection(
          'proj-123',
          'suite-123',
          'section-123',
          'section-123',
          0,
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.moveSection(
          'proj-123',
          'suite-123',
          'section-123',
          'section-123',
          0,
        ),
      ).rejects.toThrow('A section cannot be its own parent');
    });

    it('should throw NotFoundException when target parent not found', async () => {
      const section: Section = {
        ...mockSection,
        id: 'section-to-move',
        parentId: null,
        position: 0,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne
        .mockResolvedValueOnce(section)
        .mockResolvedValueOnce(null);

      await expect(
        service.moveSection(
          'proj-123',
          'suite-123',
          'section-to-move',
          'non-existent-parent',
          0,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when move would create circular reference', async () => {
      const parent: Section = {
        ...mockSection,
        id: 'parent',
        parentId: null,
        position: 0,
      };
      const child: Section = {
        ...mockSection,
        id: 'child',
        parentId: 'parent',
        position: 0,
      };

      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      // First call: findSectionByIdOrFail for 'parent'
      // Second call: findOne for targetParent 'child'
      // Third call: checkForCycle finds 'child' and gets its parent
      sectionRepository.findOne
        .mockResolvedValueOnce(parent) // findSectionByIdOrFail gets parent section
        .mockResolvedValueOnce(child) // findOne gets target parent 'child'
        .mockResolvedValueOnce(child); // checkForCycle starts with 'child', child.parentId = 'parent' === sectionId, cycle detected

      await expect(
        service.moveSection('proj-123', 'suite-123', 'parent', 'child', 0),
      ).rejects.toThrow(BadRequestException);

      sectionRepository.findOne
        .mockResolvedValueOnce(parent)
        .mockResolvedValueOnce(child)
        .mockResolvedValueOnce(child);

      await expect(
        service.moveSection('proj-123', 'suite-123', 'parent', 'child', 0),
      ).rejects.toThrow('Moving this section would create a circular reference');
    });

    it('should throw NotFoundException when section not found', async () => {
      testSuiteRepository.findOne.mockResolvedValue(mockTestSuite);
      sectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.moveSection(
          'proj-123',
          'suite-123',
          'non-existent',
          null,
          0,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
