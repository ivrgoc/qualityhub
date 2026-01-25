import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestRun } from './entities/test-run.entity';
import { CreateTestRunDto } from './dto/create-test-run.dto';

@Injectable()
export class TestRunsService {
  constructor(
    @InjectRepository(TestRun)
    private readonly testRunRepository: Repository<TestRun>,
  ) {}

  async create(
    projectId: string,
    createTestRunDto: CreateTestRunDto,
  ): Promise<TestRun> {
    const testRun = this.testRunRepository.create({
      ...createTestRunDto,
      projectId,
    });
    return this.testRunRepository.save(testRun);
  }

  async findAllByProject(projectId: string): Promise<TestRun[]> {
    return this.testRunRepository.find({ where: { projectId } });
  }

  async findById(projectId: string, id: string): Promise<TestRun> {
    const testRun = await this.testRunRepository.findOne({
      where: { id, projectId },
    });
    if (!testRun) {
      throw new NotFoundException(`Test run with ID ${id} not found`);
    }
    return testRun;
  }

  async delete(projectId: string, id: string): Promise<void> {
    const testRun = await this.findById(projectId, id);
    await this.testRunRepository.delete(testRun.id);
  }
}
