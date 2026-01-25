import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { TestCaseVersion } from './entities/test-case-version.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';

@Injectable()
export class TestCasesService {
  constructor(
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    @InjectRepository(TestCaseVersion)
    private readonly testCaseVersionRepository: Repository<TestCaseVersion>,
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
    const savedTestCase = await this.testCaseRepository.save(testCase);

    await this.createVersionSnapshot(savedTestCase, userId);

    return savedTestCase;
  }

  async findAllByProject(projectId: string): Promise<TestCase[]> {
    return this.testCaseRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(projectId: string, id: string): Promise<TestCase | null> {
    return this.testCaseRepository.findOne({
      where: { id, projectId },
    });
  }

  async findByIdOrFail(projectId: string, id: string): Promise<TestCase> {
    const testCase = await this.findById(projectId, id);
    if (!testCase) {
      throw new NotFoundException(`Test case with ID ${id} not found`);
    }
    return testCase;
  }

  async update(
    projectId: string,
    id: string,
    updateTestCaseDto: UpdateTestCaseDto,
    userId?: string,
  ): Promise<TestCase> {
    const testCase = await this.findByIdOrFail(projectId, id);

    Object.assign(testCase, updateTestCaseDto);
    testCase.version += 1;

    const savedTestCase = await this.testCaseRepository.save(testCase);

    await this.createVersionSnapshot(savedTestCase, userId);

    return savedTestCase;
  }

  async delete(projectId: string, id: string): Promise<void> {
    const testCase = await this.findByIdOrFail(projectId, id);
    await this.testCaseRepository.softDelete(testCase.id);
  }

  async getHistory(
    projectId: string,
    id: string,
  ): Promise<TestCaseVersion[]> {
    await this.findByIdOrFail(projectId, id);

    return this.testCaseVersionRepository.find({
      where: { testCaseId: id },
      order: { version: 'DESC' },
    });
  }

  private async createVersionSnapshot(
    testCase: TestCase,
    userId?: string,
  ): Promise<TestCaseVersion> {
    const versionData: Record<string, unknown> = {
      title: testCase.title,
      templateType: testCase.templateType,
      preconditions: testCase.preconditions,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult,
      priority: testCase.priority,
      estimate: testCase.estimate,
      customFields: testCase.customFields,
      sectionId: testCase.sectionId,
    };

    const version = this.testCaseVersionRepository.create({
      testCaseId: testCase.id,
      version: testCase.version,
      data: versionData,
      changedBy: userId,
    });

    return this.testCaseVersionRepository.save(version);
  }
}
