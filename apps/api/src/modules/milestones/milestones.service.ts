import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { TestPlan } from '../test-plans/entities/test-plan.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

export interface MilestoneProgress {
  milestoneId: string;
  totalTestPlans: number;
  isCompleted: boolean;
  progressPercentage: number;
}

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
    @InjectRepository(TestPlan)
    private readonly testPlanRepository: Repository<TestPlan>,
  ) {}

  async create(
    projectId: string,
    createMilestoneDto: CreateMilestoneDto,
  ): Promise<Milestone> {
    const milestone = this.milestoneRepository.create({
      ...createMilestoneDto,
      projectId,
    });
    return this.milestoneRepository.save(milestone);
  }

  async findAllByProject(projectId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(projectId: string, id: string): Promise<Milestone | null> {
    return this.milestoneRepository.findOne({
      where: { id, projectId },
    });
  }

  async findByIdOrFail(projectId: string, id: string): Promise<Milestone> {
    const milestone = await this.findById(projectId, id);
    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }
    return milestone;
  }

  async update(
    projectId: string,
    id: string,
    updateMilestoneDto: UpdateMilestoneDto,
  ): Promise<Milestone> {
    const milestone = await this.findByIdOrFail(projectId, id);
    Object.assign(milestone, updateMilestoneDto);
    return this.milestoneRepository.save(milestone);
  }

  async delete(projectId: string, id: string): Promise<void> {
    const milestone = await this.findByIdOrFail(projectId, id);
    await this.milestoneRepository.softDelete(milestone.id);
  }

  async getProgress(projectId: string, id: string): Promise<MilestoneProgress> {
    const milestone = await this.findByIdOrFail(projectId, id);

    const totalTestPlans = await this.testPlanRepository.count({
      where: { milestoneId: id },
    });

    // Progress is 100% if milestone is marked as completed, otherwise 0%
    // This can be extended later to calculate based on test execution results
    const progressPercentage = milestone.isCompleted ? 100 : 0;

    return {
      milestoneId: id,
      totalTestPlans,
      isCompleted: milestone.isCompleted,
      progressPercentage,
    };
  }

  async findByIdWithTestPlans(
    projectId: string,
    id: string,
  ): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id, projectId },
      relations: ['testPlans'],
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    return milestone;
  }
}
