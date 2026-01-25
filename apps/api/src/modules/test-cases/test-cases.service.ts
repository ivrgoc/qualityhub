import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';

@Injectable()
export class TestCasesService {
  constructor(
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
  ) {}

  async create(
    projectId: string,
    createTestCaseDto: CreateTestCaseDto,
    userId?: string,
  ): Promise<TestCase> {
    const testCase = this.testCaseRepository.create({
      ...createTestCaseDto,
      projectId,
      createdBy: userId,
      version: 1,
    });
    return this.testCaseRepository.save(testCase);
  }

  async findAllByProject(projectId: string): Promise<TestCase[]> {
    return this.testCaseRepository.find({ where: { projectId } });
  }

  async findById(projectId: string, id: string): Promise<TestCase> {
    const testCase = await this.testCaseRepository.findOne({
      where: { id, projectId },
    });
    if (!testCase) {
      throw new NotFoundException(`Test case with ID ${id} not found`);
    }
    return testCase;
  }

  async delete(projectId: string, id: string): Promise<void> {
    const testCase = await this.findById(projectId, id);
    await this.testCaseRepository.softDelete(testCase.id);
  }
}
