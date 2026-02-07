import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { TestCaseVersion } from './entities/test-case-version.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { BulkUpdateTestCaseItem } from './dto/bulk-update-test-cases.dto';

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
    } as Partial<TestCase>);
    const savedTestCase = await this.testCaseRepository.save(testCase) as TestCase;

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

  async bulkCreate(
    projectId: string,
    createTestCaseDtos: CreateTestCaseDto[],
    userId?: string,
  ): Promise<TestCase[]> {
    const testCases = createTestCaseDtos.map((dto) =>
      this.testCaseRepository.create({
        ...dto,
        projectId,
        createdBy: userId,
        version: 1,
      } as Partial<TestCase>),
    );

    const savedTestCases = await this.testCaseRepository.save(testCases);

    const versionSnapshots = savedTestCases.map((testCase) =>
      this.testCaseVersionRepository.create({
        testCaseId: testCase.id,
        version: testCase.version,
        data: this.extractVersionData(testCase),
        changedBy: userId,
      }),
    );

    await this.testCaseVersionRepository.save(versionSnapshots);

    return savedTestCases;
  }

  async bulkUpdate(
    projectId: string,
    updates: BulkUpdateTestCaseItem[],
    userId?: string,
  ): Promise<{ updated: TestCase[]; notFound: string[] }> {
    const ids = updates.map((u) => u.id);

    const existingTestCases = await this.testCaseRepository.find({
      where: { id: In(ids), projectId },
    });

    const existingIds = new Set(existingTestCases.map((tc) => tc.id));
    const notFound = ids.filter((id) => !existingIds.has(id));

    const updatedTestCases: TestCase[] = [];
    for (const update of updates) {
      const testCase = existingTestCases.find((tc) => tc.id === update.id);
      if (!testCase) continue;

      const { id, ...updateData } = update;
      void id; // id is used for finding the test case, not for updating
      Object.assign(testCase, updateData);
      testCase.version += 1;
      updatedTestCases.push(testCase);
    }

    if (updatedTestCases.length === 0) {
      return { updated: [], notFound };
    }

    const savedTestCases = await this.testCaseRepository.save(updatedTestCases);

    const versionSnapshots = savedTestCases.map((testCase) =>
      this.testCaseVersionRepository.create({
        testCaseId: testCase.id,
        version: testCase.version,
        data: this.extractVersionData(testCase),
        changedBy: userId,
      }),
    );

    await this.testCaseVersionRepository.save(versionSnapshots);

    return { updated: savedTestCases, notFound };
  }

  async bulkDelete(
    projectId: string,
    ids: string[],
  ): Promise<{ deleted: string[]; notFound: string[] }> {
    const existingTestCases = await this.testCaseRepository.find({
      where: { id: In(ids), projectId },
    });

    const existingIds = existingTestCases.map((tc) => tc.id);
    const notFound = ids.filter((id) => !existingIds.includes(id));

    if (existingIds.length > 0) {
      await this.testCaseRepository.softDelete(existingIds);
    }

    return { deleted: existingIds, notFound };
  }

  private extractVersionData(testCase: TestCase): Record<string, unknown> {
    return {
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
  }

  private async createVersionSnapshot(
    testCase: TestCase,
    userId?: string,
  ): Promise<TestCaseVersion> {
    const version = this.testCaseVersionRepository.create({
      testCaseId: testCase.id,
      version: testCase.version,
      data: this.extractVersionData(testCase),
      changedBy: userId,
    });

    return this.testCaseVersionRepository.save(version);
  }
}
