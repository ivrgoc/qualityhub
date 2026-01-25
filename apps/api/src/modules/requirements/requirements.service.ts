import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Requirement } from './entities/requirement.entity';
import { RequirementCoverage } from './entities/requirement-coverage.entity';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';

@Injectable()
export class RequirementsService {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    @InjectRepository(RequirementCoverage)
    private readonly coverageRepository: Repository<RequirementCoverage>,
  ) {}

  // ============ Requirement Operations ============

  async create(
    projectId: string,
    createRequirementDto: CreateRequirementDto,
    createdBy?: string,
  ): Promise<Requirement> {
    const requirement = this.requirementRepository.create({
      ...createRequirementDto,
      projectId,
      createdBy: createdBy || null,
    });
    return this.requirementRepository.save(requirement);
  }

  async findAllByProject(projectId: string): Promise<Requirement[]> {
    return this.requirementRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(projectId: string, id: string): Promise<Requirement | null> {
    return this.requirementRepository.findOne({
      where: { id, projectId },
    });
  }

  async findByIdOrFail(projectId: string, id: string): Promise<Requirement> {
    const requirement = await this.findById(projectId, id);
    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }
    return requirement;
  }

  async findByIdWithCoverage(projectId: string, id: string): Promise<Requirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id, projectId },
      relations: ['coverages', 'coverages.testCase'],
    });
    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }
    return requirement;
  }

  async update(
    projectId: string,
    id: string,
    updateRequirementDto: UpdateRequirementDto,
  ): Promise<Requirement> {
    const requirement = await this.findByIdOrFail(projectId, id);
    Object.assign(requirement, updateRequirementDto);
    return this.requirementRepository.save(requirement);
  }

  async delete(projectId: string, id: string): Promise<void> {
    await this.findByIdOrFail(projectId, id);
    await this.requirementRepository.softDelete(id);
  }

  // ============ Coverage Operations ============

  async getCoverage(projectId: string, requirementId: string): Promise<RequirementCoverage[]> {
    await this.findByIdOrFail(projectId, requirementId);
    return this.coverageRepository.find({
      where: { requirementId },
      relations: ['testCase'],
      order: { createdAt: 'ASC' },
    });
  }

  async addCoverage(
    projectId: string,
    requirementId: string,
    testCaseIds: string[],
    createdBy?: string,
  ): Promise<RequirementCoverage[]> {
    await this.findByIdOrFail(projectId, requirementId);

    // Find existing coverages for these test cases
    const existingCoverages = await this.coverageRepository.find({
      where: {
        requirementId,
        testCaseId: In(testCaseIds),
      },
    });

    const existingTestCaseIds = new Set(existingCoverages.map((c) => c.testCaseId));
    const newTestCaseIds = testCaseIds.filter((id) => !existingTestCaseIds.has(id));

    if (newTestCaseIds.length === 0) {
      return [];
    }

    const newCoverages = newTestCaseIds.map((testCaseId) =>
      this.coverageRepository.create({
        requirementId,
        testCaseId,
        createdBy: createdBy || null,
      }),
    );

    return this.coverageRepository.save(newCoverages);
  }

  async removeCoverage(
    projectId: string,
    requirementId: string,
    testCaseId: string,
  ): Promise<void> {
    await this.findByIdOrFail(projectId, requirementId);

    const coverage = await this.coverageRepository.findOne({
      where: { requirementId, testCaseId },
    });

    if (!coverage) {
      throw new NotFoundException(
        `Coverage for test case ${testCaseId} not found in requirement ${requirementId}`,
      );
    }

    await this.coverageRepository.delete(coverage.id);
  }

  // ============ Coverage Statistics ============

  async getCoverageStatistics(
    projectId: string,
    requirementId: string,
  ): Promise<{
    requirementId: string;
    totalTestCases: number;
  }> {
    await this.findByIdOrFail(projectId, requirementId);

    const count = await this.coverageRepository.count({
      where: { requirementId },
    });

    return {
      requirementId,
      totalTestCases: count,
    };
  }

  async getProjectCoverageStatistics(projectId: string): Promise<{
    totalRequirements: number;
    coveredRequirements: number;
    uncoveredRequirements: number;
    coveragePercentage: number;
  }> {
    const requirements = await this.requirementRepository.find({
      where: { projectId },
      select: ['id'],
    });

    const totalRequirements = requirements.length;

    if (totalRequirements === 0) {
      return {
        totalRequirements: 0,
        coveredRequirements: 0,
        uncoveredRequirements: 0,
        coveragePercentage: 0,
      };
    }

    const requirementIds = requirements.map((r) => r.id);

    const coveredRequirements = await this.coverageRepository
      .createQueryBuilder('coverage')
      .select('COUNT(DISTINCT coverage.requirement_id)', 'count')
      .where('coverage.requirement_id IN (:...ids)', { ids: requirementIds })
      .getRawOne();

    const coveredCount = parseInt(coveredRequirements.count, 10);
    const uncoveredCount = totalRequirements - coveredCount;
    const coveragePercentage =
      totalRequirements > 0 ? Math.round((coveredCount / totalRequirements) * 100) : 0;

    return {
      totalRequirements,
      coveredRequirements: coveredCount,
      uncoveredRequirements: uncoveredCount,
      coveragePercentage,
    };
  }
}
