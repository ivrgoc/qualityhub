import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async findByOrganizationId(organizationId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { organizationId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return this.projectRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<Project> {
    const project = await this.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findByIdOrFail(id);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async delete(id: string): Promise<void> {
    const project = await this.findByIdOrFail(id);
    await this.projectRepository.softDelete(project.id);
  }

  async addMember(
    projectId: string,
    addProjectMemberDto: AddProjectMemberDto,
  ): Promise<ProjectMember> {
    await this.findByIdOrFail(projectId);

    const existingMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId: addProjectMemberDto.userId },
    });

    if (existingMember) {
      throw new ConflictException(
        `User ${addProjectMemberDto.userId} is already a member of project ${projectId}`,
      );
    }

    const member = this.projectMemberRepository.create({
      projectId,
      ...addProjectMemberDto,
    });

    return this.projectMemberRepository.save(member);
  }

  async getMembers(projectId: string): Promise<ProjectMember[]> {
    await this.findByIdOrFail(projectId);
    return this.projectMemberRepository.find({
      where: { projectId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getMember(projectId: string, userId: string): Promise<ProjectMember> {
    await this.findByIdOrFail(projectId);
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException(
        `User ${userId} is not a member of project ${projectId}`,
      );
    }

    return member;
  }

  async updateMember(
    projectId: string,
    userId: string,
    updateProjectMemberDto: UpdateProjectMemberDto,
  ): Promise<ProjectMember> {
    const member = await this.getMember(projectId, userId);
    Object.assign(member, updateProjectMemberDto);
    return this.projectMemberRepository.save(member);
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const member = await this.getMember(projectId, userId);
    await this.projectMemberRepository.delete(member.id);
  }
}
