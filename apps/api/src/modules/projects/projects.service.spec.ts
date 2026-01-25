import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectRole } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let projectMemberRepository: jest.Mocked<Repository<ProjectMember>>;

  const mockProject: Project = {
    id: 'proj-123',
    organizationId: 'org-123',
    organization: null,
    name: 'Test Project',
    description: 'A test project',
    settings: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    members: [],
  };

  const mockProjectMember: ProjectMember = {
    id: 'member-123',
    projectId: 'proj-123',
    project: mockProject,
    userId: 'user-123',
    user: null,
    role: ProjectRole.TESTER,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get(getRepositoryToken(Project));
    projectMemberRepository = module.get(getRepositoryToken(ProjectMember));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProjectDto: CreateProjectDto = {
      organizationId: 'org-123',
      name: 'New Project',
      description: 'A new project',
    };

    it('should create a new project', async () => {
      const newProject = { ...mockProject, ...createProjectDto };
      projectRepository.create.mockReturnValue(newProject);
      projectRepository.save.mockResolvedValue(newProject);

      const result = await service.create(createProjectDto);

      expect(projectRepository.create).toHaveBeenCalledWith(createProjectDto);
      expect(projectRepository.save).toHaveBeenCalledWith(newProject);
      expect(result).toEqual(newProject);
    });

    it('should create a project with optional settings', async () => {
      const dtoWithSettings: CreateProjectDto = {
        ...createProjectDto,
        settings: { theme: 'dark' },
      };
      const newProject = { ...mockProject, ...dtoWithSettings };
      projectRepository.create.mockReturnValue(newProject);
      projectRepository.save.mockResolvedValue(newProject);

      const result = await service.create(dtoWithSettings);

      expect(projectRepository.create).toHaveBeenCalledWith(dtoWithSettings);
      expect(result.settings).toEqual({ theme: 'dark' });
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const projects = [mockProject];
      projectRepository.find.mockResolvedValue(projects);

      const result = await service.findAll();

      expect(projectRepository.find).toHaveBeenCalled();
      expect(result).toEqual(projects);
    });

    it('should return empty array when no projects exist', async () => {
      projectRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByOrganizationId', () => {
    it('should return projects for an organization', async () => {
      const projects = [mockProject];
      projectRepository.find.mockResolvedValue(projects);

      const result = await service.findByOrganizationId('org-123');

      expect(projectRepository.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(projects);
    });

    it('should return empty array when organization has no projects', async () => {
      projectRepository.find.mockResolvedValue([]);

      const result = await service.findByOrganizationId('org-123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a project by id', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.findById('proj-123');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should find a project by id', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.findByIdOrFail('proj-123');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdOrFail('non-existent')).rejects.toThrow(
        'Project with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const updateProjectDto: UpdateProjectDto = {
      name: 'Updated Project',
    };

    it('should update an existing project', async () => {
      const updatedProject = { ...mockProject, ...updateProjectDto };
      projectRepository.findOne.mockResolvedValue({ ...mockProject });
      projectRepository.save.mockResolvedValue(updatedProject);

      const result = await service.update('proj-123', updateProjectDto);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'proj-123',
          name: 'Updated Project',
        }),
      );
      expect(result).toEqual(updatedProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateProjectDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateProjectDto = {
        settings: { notifications: true },
      };
      const existingProject = { ...mockProject };
      const updatedProject = { ...mockProject, settings: { notifications: true } };

      projectRepository.findOne.mockResolvedValue(existingProject);
      projectRepository.save.mockResolvedValue(updatedProject);

      const result = await service.update('proj-123', partialUpdate);

      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'proj-123',
          name: 'Test Project',
          settings: { notifications: true },
        }),
      );
      expect(result.settings).toEqual({ notifications: true });
    });
  });

  describe('delete', () => {
    it('should soft delete an existing project', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectRepository.softDelete.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.delete('proj-123');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(projectRepository.softDelete).toHaveBeenCalledWith('proj-123');
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(projectRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('addMember', () => {
    const addProjectMemberDto: AddProjectMemberDto = {
      userId: 'user-456',
      role: ProjectRole.LEAD,
    };

    it('should add a new member to a project', async () => {
      const newMember = {
        ...mockProjectMember,
        userId: 'user-456',
        role: ProjectRole.LEAD,
      };
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(null);
      projectMemberRepository.create.mockReturnValue(newMember);
      projectMemberRepository.save.mockResolvedValue(newMember);

      const result = await service.addMember('proj-123', addProjectMemberDto);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(projectMemberRepository.findOne).toHaveBeenCalledWith({
        where: { projectId: 'proj-123', userId: 'user-456' },
      });
      expect(projectMemberRepository.create).toHaveBeenCalledWith({
        projectId: 'proj-123',
        ...addProjectMemberDto,
      });
      expect(projectMemberRepository.save).toHaveBeenCalledWith(newMember);
      expect(result).toEqual(newMember);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addMember('non-existent', addProjectMemberDto),
      ).rejects.toThrow(NotFoundException);
      expect(projectMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user is already a member', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(mockProjectMember);

      await expect(
        service.addMember('proj-123', { userId: 'user-123' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addMember('proj-123', { userId: 'user-123' }),
      ).rejects.toThrow(
        'User user-123 is already a member of project proj-123',
      );
      expect(projectMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should add member with default role when role not specified', async () => {
      const addMemberDtoWithoutRole: AddProjectMemberDto = {
        userId: 'user-789',
      };
      const newMember = {
        ...mockProjectMember,
        userId: 'user-789',
        role: ProjectRole.TESTER,
      };
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(null);
      projectMemberRepository.create.mockReturnValue(newMember);
      projectMemberRepository.save.mockResolvedValue(newMember);

      const result = await service.addMember('proj-123', addMemberDtoWithoutRole);

      expect(projectMemberRepository.create).toHaveBeenCalledWith({
        projectId: 'proj-123',
        ...addMemberDtoWithoutRole,
      });
      expect(result).toEqual(newMember);
    });
  });

  describe('getMembers', () => {
    it('should return all members of a project', async () => {
      const members = [
        mockProjectMember,
        { ...mockProjectMember, id: 'member-456', userId: 'user-456' },
      ];
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.find.mockResolvedValue(members);

      const result = await service.getMembers('proj-123');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(projectMemberRepository.find).toHaveBeenCalledWith({
        where: { projectId: 'proj-123' },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(members);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when project has no members', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.find.mockResolvedValue([]);

      const result = await service.getMembers('proj-123');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.getMembers('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(projectMemberRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getMember', () => {
    it('should return a specific member of a project', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(mockProjectMember);

      const result = await service.getMember('proj-123', 'user-123');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(projectMemberRepository.findOne).toHaveBeenCalledWith({
        where: { projectId: 'proj-123', userId: 'user-123' },
        relations: ['user'],
      });
      expect(result).toEqual(mockProjectMember);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.getMember('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(projectMemberRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when member not found', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.getMember('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getMember('proj-123', 'non-existent')).rejects.toThrow(
        'User non-existent is not a member of project proj-123',
      );
    });
  });

  describe('updateMember', () => {
    const updateProjectMemberDto: UpdateProjectMemberDto = {
      role: ProjectRole.ADMIN,
    };

    it('should update a member role', async () => {
      const updatedMember = { ...mockProjectMember, role: ProjectRole.ADMIN };
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue({ ...mockProjectMember });
      projectMemberRepository.save.mockResolvedValue(updatedMember);

      const result = await service.updateMember(
        'proj-123',
        'user-123',
        updateProjectMemberDto,
      );

      expect(projectMemberRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-123',
          userId: 'user-123',
          role: ProjectRole.ADMIN,
        }),
      );
      expect(result).toEqual(updatedMember);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMember('non-existent', 'user-123', updateProjectMemberDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when member not found', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMember('proj-123', 'non-existent', updateProjectMemberDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a project', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(mockProjectMember);
      projectMemberRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.removeMember('proj-123', 'user-123');

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
      });
      expect(projectMemberRepository.findOne).toHaveBeenCalledWith({
        where: { projectId: 'proj-123', userId: 'user-123' },
        relations: ['user'],
      });
      expect(projectMemberRepository.delete).toHaveBeenCalledWith('member-123');
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.removeMember('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
      expect(projectMemberRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when member not found', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      projectMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.removeMember('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(projectMemberRepository.delete).not.toHaveBeenCalled();
    });
  });
});
