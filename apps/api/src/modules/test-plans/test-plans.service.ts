import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestPlan } from './entities/test-plan.entity';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';

@Injectable()
export class TestPlansService {
  constructor(
    @InjectRepository(TestPlan)
    private readonly testPlanRepository: Repository<TestPlan>,
  ) {}

  async create(
    projectId: string,
    createTestPlanDto: CreateTestPlanDto,
  ): Promise<TestPlan> {
    const testPlan = this.testPlanRepository.create({
      ...createTestPlanDto,
      projectId,
    });
    return this.testPlanRepository.save(testPlan);
  }

  async findAllByProject(projectId: string): Promise<TestPlan[]> {
    return this.testPlanRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(projectId: string, id: string): Promise<TestPlan | null> {
    return this.testPlanRepository.findOne({
      where: { id, projectId },
    });
  }

  async findByIdOrFail(projectId: string, id: string): Promise<TestPlan> {
    const testPlan = await this.findById(projectId, id);
    if (!testPlan) {
      throw new NotFoundException(`Test plan with ID ${id} not found`);
    }
    return testPlan;
  }

  async update(
    projectId: string,
    id: string,
    updateTestPlanDto: UpdateTestPlanDto,
  ): Promise<TestPlan> {
    const testPlan = await this.findByIdOrFail(projectId, id);
    Object.assign(testPlan, updateTestPlanDto);
    return this.testPlanRepository.save(testPlan);
  }

  async delete(projectId: string, id: string): Promise<void> {
    const testPlan = await this.findByIdOrFail(projectId, id);
    await this.testPlanRepository.softDelete(testPlan.id);
  }

  async findByIdWithMilestone(
    projectId: string,
    id: string,
  ): Promise<TestPlan> {
    const testPlan = await this.testPlanRepository.findOne({
      where: { id, projectId },
      relations: ['milestone'],
    });

    if (!testPlan) {
      throw new NotFoundException(`Test plan with ID ${id} not found`);
    }

    return testPlan;
  }
}
