import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TestPlan } from './entities/test-plan.entity';
import { TestPlanEntry } from './entities/test-plan-entry.entity';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { UpdateTestPlanDto } from './dto/update-test-plan.dto';
import { CreateTestPlanEntryDto } from './dto/create-test-plan-entry.dto';
import { UpdateTestPlanEntryDto } from './dto/update-test-plan-entry.dto';

@Injectable()
export class TestPlansService {
  constructor(
    @InjectRepository(TestPlan)
    private readonly testPlanRepository: Repository<TestPlan>,
    @InjectRepository(TestPlanEntry)
    private readonly testPlanEntryRepository: Repository<TestPlanEntry>,
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

  async findByIdWithEntries(projectId: string, id: string): Promise<TestPlan> {
    const testPlan = await this.testPlanRepository.findOne({
      where: { id, projectId },
      relations: ['entries', 'entries.testCase'],
    });

    if (!testPlan) {
      throw new NotFoundException(`Test plan with ID ${id} not found`);
    }

    return testPlan;
  }

  async getEntries(projectId: string, testPlanId: string): Promise<TestPlanEntry[]> {
    await this.findByIdOrFail(projectId, testPlanId);

    return this.testPlanEntryRepository.find({
      where: { testPlanId },
      relations: ['testCase'],
      order: { position: 'ASC' },
    });
  }

  async addEntry(
    projectId: string,
    testPlanId: string,
    createTestPlanEntryDto: CreateTestPlanEntryDto,
  ): Promise<TestPlanEntry> {
    await this.findByIdOrFail(projectId, testPlanId);

    const existingEntry = await this.testPlanEntryRepository.findOne({
      where: {
        testPlanId,
        testCaseId: createTestPlanEntryDto.testCaseId,
      },
    });

    if (existingEntry) {
      throw new ConflictException(
        `Test case ${createTestPlanEntryDto.testCaseId} is already in this test plan`,
      );
    }

    let position = createTestPlanEntryDto.position;
    if (position === undefined) {
      const maxPositionResult = await this.testPlanEntryRepository
        .createQueryBuilder('entry')
        .select('MAX(entry.position)', 'maxPosition')
        .where('entry.testPlanId = :testPlanId', { testPlanId })
        .getRawOne();
      position = (maxPositionResult?.maxPosition ?? -1) + 1;
    }

    const entry = this.testPlanEntryRepository.create({
      testPlanId,
      testCaseId: createTestPlanEntryDto.testCaseId,
      position,
    });

    return this.testPlanEntryRepository.save(entry);
  }

  async addEntries(
    projectId: string,
    testPlanId: string,
    testCaseIds: string[],
  ): Promise<TestPlanEntry[]> {
    await this.findByIdOrFail(projectId, testPlanId);

    const existingEntries = await this.testPlanEntryRepository.find({
      where: {
        testPlanId,
        testCaseId: In(testCaseIds),
      },
    });

    const existingTestCaseIds = new Set(existingEntries.map((e) => e.testCaseId));
    const newTestCaseIds = testCaseIds.filter((id) => !existingTestCaseIds.has(id));

    if (newTestCaseIds.length === 0) {
      return [];
    }

    const maxPositionResult = await this.testPlanEntryRepository
      .createQueryBuilder('entry')
      .select('MAX(entry.position)', 'maxPosition')
      .where('entry.testPlanId = :testPlanId', { testPlanId })
      .getRawOne();
    let position = (maxPositionResult?.maxPosition ?? -1) + 1;

    const entries = newTestCaseIds.map((testCaseId) => {
      const entry = this.testPlanEntryRepository.create({
        testPlanId,
        testCaseId,
        position: position++,
      });
      return entry;
    });

    return this.testPlanEntryRepository.save(entries);
  }

  async updateEntry(
    projectId: string,
    testPlanId: string,
    entryId: string,
    updateTestPlanEntryDto: UpdateTestPlanEntryDto,
  ): Promise<TestPlanEntry> {
    await this.findByIdOrFail(projectId, testPlanId);

    const entry = await this.testPlanEntryRepository.findOne({
      where: { id: entryId, testPlanId },
    });

    if (!entry) {
      throw new NotFoundException(`Entry with ID ${entryId} not found`);
    }

    Object.assign(entry, updateTestPlanEntryDto);
    return this.testPlanEntryRepository.save(entry);
  }

  async removeEntry(
    projectId: string,
    testPlanId: string,
    entryId: string,
  ): Promise<void> {
    await this.findByIdOrFail(projectId, testPlanId);

    const entry = await this.testPlanEntryRepository.findOne({
      where: { id: entryId, testPlanId },
    });

    if (!entry) {
      throw new NotFoundException(`Entry with ID ${entryId} not found`);
    }

    await this.testPlanEntryRepository.delete(entry.id);
  }

  async removeEntries(
    projectId: string,
    testPlanId: string,
    entryIds: string[],
  ): Promise<void> {
    await this.findByIdOrFail(projectId, testPlanId);

    await this.testPlanEntryRepository.delete({
      id: In(entryIds),
      testPlanId,
    });
  }
}
