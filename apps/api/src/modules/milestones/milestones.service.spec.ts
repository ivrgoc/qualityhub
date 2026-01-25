import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { Milestone } from './entities/milestone.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

describe('MilestonesService', () => {
  let service: MilestonesService;
  let milestoneRepository: jest.Mocked<Repository<Milestone>>;

  const mockMilestone: Milestone = {
    id: 'milestone-123',
    projectId: 'proj-123',
    project: null,
    name: 'Q1 Release',
    description: 'End of quarter milestone',
    dueDate: new Date('2024-03-31'),
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestonesService,
        {
          provide: getRepositoryToken(Milestone),
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

    service = module.get<MilestonesService>(MilestonesService);
    milestoneRepository = module.get(getRepositoryToken(Milestone));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMilestoneDto: CreateMilestoneDto = {
      name: 'New Milestone',
      description: 'A new milestone',
      dueDate: '2024-06-30',
    };

    it('should create a new milestone', async () => {
      const newMilestone = { ...mockMilestone, ...createMilestoneDto };
      milestoneRepository.create.mockReturnValue(newMilestone);
      milestoneRepository.save.mockResolvedValue(newMilestone);

      const result = await service.create('proj-123', createMilestoneDto);

      expect(milestoneRepository.create).toHaveBeenCalledWith({
        ...createMilestoneDto,
        projectId: 'proj-123',
      });
      expect(milestoneRepository.save).toHaveBeenCalledWith(newMilestone);
      expect(result).toEqual(newMilestone);
    });

    it('should create a milestone with only required fields', async () => {
      const minimalDto: CreateMilestoneDto = {
        name: 'Minimal Milestone',
      };
      const newMilestone = { ...mockMilestone, ...minimalDto, description: null, dueDate: null };
      milestoneRepository.create.mockReturnValue(newMilestone);
      milestoneRepository.save.mockResolvedValue(newMilestone);

      const result = await service.create('proj-123', minimalDto);

      expect(milestoneRepository.create).toHaveBeenCalledWith({
        ...minimalDto,
        projectId: 'proj-123',
      });
      expect(result).toEqual(newMilestone);
    });

    it('should create a milestone with completed status', async () => {
      const dtoWithCompleted: CreateMilestoneDto = {
        ...createMilestoneDto,
        completed: true,
      };
      const newMilestone = { ...mockMilestone, ...dtoWithCompleted };
      milestoneRepository.create.mockReturnValue(newMilestone);
      milestoneRepository.save.mockResolvedValue(newMilestone);

      const result = await service.create('proj-123', dtoWithCompleted);

      expect(milestoneRepository.create).toHaveBeenCalledWith({
        ...dtoWithCompleted,
        projectId: 'proj-123',
      });
      expect(result.completed).toBe(true);
    });
  });

  describe('findAllByProject', () => {
    it('should return all milestones for a project', async () => {
      const milestones = [mockMilestone];
      milestoneRepository.find.mockResolvedValue(milestones);

      const result = await service.findAllByProject('proj-123');

      expect(milestoneRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(milestones);
    });

    it('should return empty array when no milestones exist', async () => {
      milestoneRepository.find.mockResolvedValue([]);

      const result = await service.findAllByProject('proj-123');

      expect(result).toEqual([]);
    });

    it('should return multiple milestones ordered by createdAt', async () => {
      const milestones = [
        { ...mockMilestone, id: 'milestone-1', createdAt: new Date('2024-01-01') },
        { ...mockMilestone, id: 'milestone-2', createdAt: new Date('2024-02-01') },
      ];
      milestoneRepository.find.mockResolvedValue(milestones);

      const result = await service.findAllByProject('proj-123');

      expect(result).toHaveLength(2);
      expect(milestoneRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should find a milestone by id and projectId', async () => {
      milestoneRepository.findOne.mockResolvedValue(mockMilestone);

      const result = await service.findById('proj-123', 'milestone-123');

      expect(milestoneRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'milestone-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockMilestone);
    });

    it('should return null when milestone not found', async () => {
      milestoneRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('proj-123', 'non-existent');

      expect(result).toBeNull();
    });

    it('should return null when milestone exists but belongs to different project', async () => {
      milestoneRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('different-proj', 'milestone-123');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a milestone by id and projectId', async () => {
      milestoneRepository.findOne.mockResolvedValue(mockMilestone);

      const result = await service.findByIdOrFail('proj-123', 'milestone-123');

      expect(milestoneRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'milestone-123', projectId: 'proj-123' },
      });
      expect(result).toEqual(mockMilestone);
    });

    it('should throw NotFoundException when milestone not found', async () => {
      milestoneRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('proj-123', 'non-existent')).rejects.toThrow(
        'Milestone with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const updateMilestoneDto: UpdateMilestoneDto = {
      name: 'Updated Milestone',
    };

    it('should update an existing milestone', async () => {
      const updatedMilestone = { ...mockMilestone, ...updateMilestoneDto };
      milestoneRepository.findOne.mockResolvedValue({ ...mockMilestone });
      milestoneRepository.save.mockResolvedValue(updatedMilestone);

      const result = await service.update('proj-123', 'milestone-123', updateMilestoneDto);

      expect(milestoneRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'milestone-123', projectId: 'proj-123' },
      });
      expect(milestoneRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'milestone-123',
          name: 'Updated Milestone',
        }),
      );
      expect(result).toEqual(updatedMilestone);
    });

    it('should throw NotFoundException when milestone not found', async () => {
      milestoneRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-123', 'non-existent', updateMilestoneDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateMilestoneDto = {
        completed: true,
      };
      const existingMilestone = { ...mockMilestone };
      const updatedMilestone = { ...mockMilestone, completed: true };

      milestoneRepository.findOne.mockResolvedValue(existingMilestone);
      milestoneRepository.save.mockResolvedValue(updatedMilestone);

      const result = await service.update('proj-123', 'milestone-123', partialUpdate);

      expect(milestoneRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'milestone-123',
          name: 'Q1 Release',
          completed: true,
        }),
      );
      expect(result.completed).toBe(true);
    });

    it('should update description', async () => {
      const updateDto: UpdateMilestoneDto = {
        description: 'New description',
      };
      const existingMilestone = { ...mockMilestone };
      const updatedMilestone = { ...mockMilestone, description: 'New description' };

      milestoneRepository.findOne.mockResolvedValue(existingMilestone);
      milestoneRepository.save.mockResolvedValue(updatedMilestone);

      const result = await service.update('proj-123', 'milestone-123', updateDto);

      expect(result.description).toBe('New description');
    });

    it('should update dueDate', async () => {
      const updateDto: UpdateMilestoneDto = {
        dueDate: '2024-12-31',
      };
      const existingMilestone = { ...mockMilestone };
      const updatedMilestone = { ...mockMilestone, dueDate: '2024-12-31' };

      milestoneRepository.findOne.mockResolvedValue(existingMilestone);
      milestoneRepository.save.mockResolvedValue(updatedMilestone);

      const result = await service.update('proj-123', 'milestone-123', updateDto);

      expect(result.dueDate).toBe('2024-12-31');
    });
  });

  describe('delete', () => {
    it('should soft delete an existing milestone', async () => {
      milestoneRepository.findOne.mockResolvedValue(mockMilestone);
      milestoneRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.delete('proj-123', 'milestone-123');

      expect(milestoneRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'milestone-123', projectId: 'proj-123' },
      });
      expect(milestoneRepository.softDelete).toHaveBeenCalledWith('milestone-123');
    });

    it('should throw NotFoundException when milestone not found', async () => {
      milestoneRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(milestoneRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should not delete milestone from different project', async () => {
      milestoneRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('different-proj', 'milestone-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(milestoneRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
