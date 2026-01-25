import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectRole } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: jest.Mocked<ProjectsService>;

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
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            addMember: jest.fn(),
            getMembers: jest.fn(),
            getMember: jest.fn(),
            updateMember: jest.fn(),
            removeMember: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createProjectDto: CreateProjectDto = {
      organizationId: 'org-123',
      name: 'New Project',
      description: 'A new project',
    };

    it('should create a new project', async () => {
      const newProject = { ...mockProject, ...createProjectDto };
      service.create.mockResolvedValue(newProject);

      const result = await controller.create(createProjectDto);

      expect(service.create).toHaveBeenCalledWith(createProjectDto);
      expect(result).toEqual(newProject);
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const projects = [mockProject];
      service.findAll.mockResolvedValue(projects);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(projects);
    });

    it('should return empty array when no projects exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a project by id', async () => {
      service.findByIdOrFail.mockResolvedValue(mockProject);

      const result = await controller.findById('proj-123');

      expect(service.findByIdOrFail).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      service.findByIdOrFail.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(controller.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateProjectDto: UpdateProjectDto = {
      name: 'Updated Project',
    };

    it('should update a project', async () => {
      const updatedProject = { ...mockProject, ...updateProjectDto };
      service.update.mockResolvedValue(updatedProject);

      const result = await controller.update('proj-123', updateProjectDto);

      expect(service.update).toHaveBeenCalledWith('proj-123', updateProjectDto);
      expect(result).toEqual(updatedProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(
        controller.update('non-existent', updateProjectDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('proj-123');

      expect(service.delete).toHaveBeenCalledWith('proj-123');
    });

    it('should throw NotFoundException when project not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(controller.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMember', () => {
    const addProjectMemberDto: AddProjectMemberDto = {
      userId: 'user-456',
      role: ProjectRole.LEAD,
    };

    it('should add a member to a project', async () => {
      const newMember = {
        ...mockProjectMember,
        userId: 'user-456',
        role: ProjectRole.LEAD,
      };
      service.addMember.mockResolvedValue(newMember);

      const result = await controller.addMember('proj-123', addProjectMemberDto);

      expect(service.addMember).toHaveBeenCalledWith('proj-123', addProjectMemberDto);
      expect(result).toEqual(newMember);
    });

    it('should throw NotFoundException when project not found', async () => {
      service.addMember.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(
        controller.addMember('non-existent', addProjectMemberDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when user is already a member', async () => {
      service.addMember.mockRejectedValue(
        new ConflictException('User user-123 is already a member of project proj-123'),
      );

      await expect(
        controller.addMember('proj-123', { userId: 'user-123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getMembers', () => {
    it('should return all members of a project', async () => {
      const members = [mockProjectMember];
      service.getMembers.mockResolvedValue(members);

      const result = await controller.getMembers('proj-123');

      expect(service.getMembers).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(members);
    });

    it('should return empty array when project has no members', async () => {
      service.getMembers.mockResolvedValue([]);

      const result = await controller.getMembers('proj-123');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when project not found', async () => {
      service.getMembers.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(controller.getMembers('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMember', () => {
    it('should return a specific member of a project', async () => {
      service.getMember.mockResolvedValue(mockProjectMember);

      const result = await controller.getMember('proj-123', 'user-123');

      expect(service.getMember).toHaveBeenCalledWith('proj-123', 'user-123');
      expect(result).toEqual(mockProjectMember);
    });

    it('should throw NotFoundException when project not found', async () => {
      service.getMember.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(controller.getMember('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when member not found', async () => {
      service.getMember.mockRejectedValue(
        new NotFoundException('User non-existent is not a member of project proj-123'),
      );

      await expect(controller.getMember('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMember', () => {
    const updateProjectMemberDto: UpdateProjectMemberDto = {
      role: ProjectRole.ADMIN,
    };

    it('should update a member role', async () => {
      const updatedMember = { ...mockProjectMember, role: ProjectRole.ADMIN };
      service.updateMember.mockResolvedValue(updatedMember);

      const result = await controller.updateMember(
        'proj-123',
        'user-123',
        updateProjectMemberDto,
      );

      expect(service.updateMember).toHaveBeenCalledWith(
        'proj-123',
        'user-123',
        updateProjectMemberDto,
      );
      expect(result).toEqual(updatedMember);
    });

    it('should throw NotFoundException when project not found', async () => {
      service.updateMember.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(
        controller.updateMember('non-existent', 'user-123', updateProjectMemberDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when member not found', async () => {
      service.updateMember.mockRejectedValue(
        new NotFoundException('User non-existent is not a member of project proj-123'),
      );

      await expect(
        controller.updateMember('proj-123', 'non-existent', updateProjectMemberDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a project', async () => {
      service.removeMember.mockResolvedValue(undefined);

      await controller.removeMember('proj-123', 'user-123');

      expect(service.removeMember).toHaveBeenCalledWith('proj-123', 'user-123');
    });

    it('should throw NotFoundException when project not found', async () => {
      service.removeMember.mockRejectedValue(
        new NotFoundException('Project with ID non-existent not found'),
      );

      await expect(controller.removeMember('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when member not found', async () => {
      service.removeMember.mockRejectedValue(
        new NotFoundException('User non-existent is not a member of project proj-123'),
      );

      await expect(controller.removeMember('proj-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
