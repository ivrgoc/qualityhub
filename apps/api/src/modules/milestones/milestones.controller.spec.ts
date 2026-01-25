import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { Milestone } from './entities/milestone.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

describe('MilestonesController', () => {
  let controller: MilestonesController;
  let service: jest.Mocked<MilestonesService>;

  const mockMilestone: Milestone = {
    id: 'milestone-123',
    projectId: 'proj-123',
    project: null,
    name: 'Q1 Release',
    description: 'End of quarter milestone',
    dueDate: new Date('2024-03-31'),
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilestonesController],
      providers: [
        {
          provide: MilestonesService,
          useValue: {
            create: jest.fn(),
            findAllByProject: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MilestonesController>(MilestonesController);
    service = module.get(MilestonesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createMilestoneDto: CreateMilestoneDto = {
      name: 'New Milestone',
      description: 'A new milestone',
      dueDate: '2024-06-30',
    };

    it('should create a new milestone', async () => {
      const newMilestone = { ...mockMilestone, ...createMilestoneDto };
      service.create.mockResolvedValue(newMilestone);

      const result = await controller.create('proj-123', createMilestoneDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', createMilestoneDto);
      expect(result).toEqual(newMilestone);
    });

    it('should create a milestone with minimal data', async () => {
      const minimalDto: CreateMilestoneDto = {
        name: 'Minimal Milestone',
      };
      const newMilestone = { ...mockMilestone, name: 'Minimal Milestone' };
      service.create.mockResolvedValue(newMilestone);

      const result = await controller.create('proj-123', minimalDto);

      expect(service.create).toHaveBeenCalledWith('proj-123', minimalDto);
      expect(result).toEqual(newMilestone);
    });
  });

  describe('findAll', () => {
    it('should return all milestones for a project', async () => {
      const milestones = [mockMilestone];
      service.findAllByProject.mockResolvedValue(milestones);

      const result = await controller.findAll('proj-123');

      expect(service.findAllByProject).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(milestones);
    });

    it('should return empty array when no milestones exist', async () => {
      service.findAllByProject.mockResolvedValue([]);

      const result = await controller.findAll('proj-123');

      expect(result).toEqual([]);
    });

    it('should return multiple milestones', async () => {
      const milestones = [
        mockMilestone,
        { ...mockMilestone, id: 'milestone-456', name: 'Q2 Release' },
      ];
      service.findAllByProject.mockResolvedValue(milestones);

      const result = await controller.findAll('proj-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return a milestone by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockMilestone);

      const result = await controller.findById('proj-123', 'milestone-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123', 'milestone-123');
      expect(result).toEqual(mockMilestone);
    });

    it('should throw NotFoundException when milestone not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Milestone with ID non-existent not found'),
      );

      await expect(controller.findById('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateMilestoneDto: UpdateMilestoneDto = {
      name: 'Updated Milestone',
      isCompleted: true,
    };

    it('should update a milestone', async () => {
      const updatedMilestone = { ...mockMilestone, ...updateMilestoneDto };
      service.update.mockResolvedValue(updatedMilestone);

      const result = await controller.update('proj-123', 'milestone-123', updateMilestoneDto);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'milestone-123', updateMilestoneDto);
      expect(result).toEqual(updatedMilestone);
      expect(result.name).toBe('Updated Milestone');
      expect(result.isCompleted).toBe(true);
    });

    it('should update a milestone with partial data', async () => {
      const partialUpdate: UpdateMilestoneDto = {
        isCompleted: true,
      };
      const updatedMilestone = { ...mockMilestone, isCompleted: true };
      service.update.mockResolvedValue(updatedMilestone);

      const result = await controller.update('proj-123', 'milestone-123', partialUpdate);

      expect(service.update).toHaveBeenCalledWith('proj-123', 'milestone-123', partialUpdate);
      expect(result.isCompleted).toBe(true);
    });

    it('should throw NotFoundException when milestone not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Milestone with ID non-existent not found'),
      );

      await expect(
        controller.update('proj-123', 'non-existent', updateMilestoneDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a milestone', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123', 'milestone-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123', 'milestone-123');
    });

    it('should throw NotFoundException when milestone not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Milestone with ID non-existent not found'),
      );

      await expect(controller.delete('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
