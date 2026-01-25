import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
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
}
