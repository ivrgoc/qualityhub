import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TestSuite } from './entities/test-suite.entity';
import { Section } from './entities/section.entity';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

export interface SectionTreeNode extends Section {
  children: SectionTreeNode[];
}

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

  async getSectionTree(
    projectId: string,
    suiteId: string,
  ): Promise<SectionTreeNode[]> {
    await this.findByIdOrFail(projectId, suiteId);
    const sections = await this.sectionRepository.find({
      where: { suiteId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
    return this.buildTree(sections);
  }

  private buildTree(sections: Section[]): SectionTreeNode[] {
    const sectionMap = new Map<string, SectionTreeNode>();
    const rootNodes: SectionTreeNode[] = [];

    for (const section of sections) {
      sectionMap.set(section.id, { ...section, children: [] });
    }

    for (const section of sections) {
      const node = sectionMap.get(section.id)!;
      if (section.parentId === null) {
        rootNodes.push(node);
      } else {
        const parent = sectionMap.get(section.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    }

    return rootNodes;
  }

  async getSectionChildren(
    projectId: string,
    suiteId: string,
    sectionId: string | null,
  ): Promise<Section[]> {
    await this.findByIdOrFail(projectId, suiteId);
    return this.sectionRepository.find({
      where: {
        suiteId,
        parentId: sectionId === null ? IsNull() : sectionId,
      },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async getSectionAncestors(
    projectId: string,
    suiteId: string,
    sectionId: string,
  ): Promise<Section[]> {
    const section = await this.findSectionByIdOrFail(
      projectId,
      suiteId,
      sectionId,
    );

    const ancestors: Section[] = [];
    let currentParentId = section.parentId;

    while (currentParentId !== null) {
      const parent = await this.sectionRepository.findOne({
        where: { id: currentParentId, suiteId },
      });
      if (!parent) {
        break;
      }
      ancestors.unshift(parent);
      currentParentId = parent.parentId;
    }

    return ancestors;
  }

  async moveSection(
    projectId: string,
    suiteId: string,
    sectionId: string,
    targetParentId: string | null,
    targetPosition: number,
  ): Promise<Section> {
    const section = await this.findSectionByIdOrFail(
      projectId,
      suiteId,
      sectionId,
    );

    if (targetParentId === sectionId) {
      throw new BadRequestException('A section cannot be its own parent');
    }

    if (targetParentId !== null) {
      const targetParent = await this.sectionRepository.findOne({
        where: { id: targetParentId, suiteId },
      });
      if (!targetParent) {
        throw new NotFoundException(
          `Target parent section with ID ${targetParentId} not found in suite ${suiteId}`,
        );
      }

      const wouldCreateCycle = await this.checkForCycle(
        suiteId,
        sectionId,
        targetParentId,
      );
      if (wouldCreateCycle) {
        throw new BadRequestException(
          'Moving this section would create a circular reference',
        );
      }
    }

    const siblings = await this.sectionRepository.find({
      where: {
        suiteId,
        parentId: targetParentId === null ? IsNull() : targetParentId,
      },
      order: { position: 'ASC' },
    });

    const filteredSiblings = siblings.filter((s) => s.id !== sectionId);

    const clampedPosition = Math.max(
      0,
      Math.min(targetPosition, filteredSiblings.length),
    );

    for (let i = 0; i < filteredSiblings.length; i++) {
      const sibling = filteredSiblings[i];
      const newPosition = i >= clampedPosition ? i + 1 : i;
      if (sibling.position !== newPosition) {
        sibling.position = newPosition;
        await this.sectionRepository.save(sibling);
      }
    }

    section.parentId = targetParentId;
    section.position = clampedPosition;
    return this.sectionRepository.save(section);
  }

  private async checkForCycle(
    suiteId: string,
    sectionId: string,
    targetParentId: string,
  ): Promise<boolean> {
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId !== null) {
      if (currentId === sectionId) {
        return true;
      }
      if (visited.has(currentId)) {
        return true;
      }
      visited.add(currentId);

      const parent = await this.sectionRepository.findOne({
        where: { id: currentId, suiteId },
      });
      currentId = parent?.parentId ?? null;
    }

    return false;
  }
}
