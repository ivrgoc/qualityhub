import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSuite } from './entities/test-suite.entity';
import { Section } from './entities/section.entity';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class TestSuitesService {
  constructor(
    @InjectRepository(TestSuite)
    private readonly testSuiteRepository: Repository<TestSuite>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async create(
    projectId: string,
    createTestSuiteDto: CreateTestSuiteDto,
  ): Promise<TestSuite> {
    const suite = this.testSuiteRepository.create({
      projectId,
      ...createTestSuiteDto,
    });
    return this.testSuiteRepository.save(suite);
  }

  async findAllByProject(projectId: string): Promise<TestSuite[]> {
    return this.testSuiteRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(projectId: string, id: string): Promise<TestSuite | null> {
    return this.testSuiteRepository.findOne({
      where: { id, projectId },
    });
  }

  async findByIdOrFail(projectId: string, id: string): Promise<TestSuite> {
    const suite = await this.findById(projectId, id);
    if (!suite) {
      throw new NotFoundException(`Test suite with ID ${id} not found`);
    }
    return suite;
  }

  async update(
    projectId: string,
    id: string,
    updateTestSuiteDto: UpdateTestSuiteDto,
  ): Promise<TestSuite> {
    const suite = await this.findByIdOrFail(projectId, id);
    Object.assign(suite, updateTestSuiteDto);
    return this.testSuiteRepository.save(suite);
  }

  async delete(projectId: string, id: string): Promise<void> {
    const suite = await this.findByIdOrFail(projectId, id);
    await this.testSuiteRepository.delete(suite.id);
  }

  async createSection(
    projectId: string,
    suiteId: string,
    createSectionDto: CreateSectionDto,
  ): Promise<Section> {
    await this.findByIdOrFail(projectId, suiteId);

    if (createSectionDto.parentId) {
      const parentSection = await this.sectionRepository.findOne({
        where: { id: createSectionDto.parentId, suiteId },
      });
      if (!parentSection) {
        throw new NotFoundException(
          `Parent section with ID ${createSectionDto.parentId} not found in suite ${suiteId}`,
        );
      }
    }

    const section = this.sectionRepository.create({
      suiteId,
      ...createSectionDto,
      position: createSectionDto.position ?? 0,
    });
    return this.sectionRepository.save(section);
  }

  async findSectionsBySuite(
    projectId: string,
    suiteId: string,
  ): Promise<Section[]> {
    await this.findByIdOrFail(projectId, suiteId);
    return this.sectionRepository.find({
      where: { suiteId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findSectionById(
    projectId: string,
    suiteId: string,
    sectionId: string,
  ): Promise<Section | null> {
    await this.findByIdOrFail(projectId, suiteId);
    return this.sectionRepository.findOne({
      where: { id: sectionId, suiteId },
    });
  }

  async findSectionByIdOrFail(
    projectId: string,
    suiteId: string,
    sectionId: string,
  ): Promise<Section> {
    const section = await this.findSectionById(projectId, suiteId, sectionId);
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }
    return section;
  }

  async updateSection(
    projectId: string,
    suiteId: string,
    sectionId: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const section = await this.findSectionByIdOrFail(
      projectId,
      suiteId,
      sectionId,
    );

    if (
      updateSectionDto.parentId !== undefined &&
      updateSectionDto.parentId !== null
    ) {
      if (updateSectionDto.parentId === sectionId) {
        throw new NotFoundException('A section cannot be its own parent');
      }
      const parentSection = await this.sectionRepository.findOne({
        where: { id: updateSectionDto.parentId, suiteId },
      });
      if (!parentSection) {
        throw new NotFoundException(
          `Parent section with ID ${updateSectionDto.parentId} not found in suite ${suiteId}`,
        );
      }
    }

    Object.assign(section, updateSectionDto);
    return this.sectionRepository.save(section);
  }

  async deleteSection(
    projectId: string,
    suiteId: string,
    sectionId: string,
  ): Promise<void> {
    const section = await this.findSectionByIdOrFail(
      projectId,
      suiteId,
      sectionId,
    );
    await this.sectionRepository.delete(section.id);
  }
}
