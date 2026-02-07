import { Project } from '../../modules/projects/entities/project.entity';
import { Organization } from '../../modules/organizations/entities/organization.entity';
import { getTestDataSource } from '../test-database';
import { createOrganization } from './organization.factory';

let projectCounter = 0;

export interface CreateProjectOptions {
  name?: string;
  description?: string;
  organizationId?: string;
  organization?: Organization;
  settings?: Record<string, unknown>;
}

/**
 * Create a test project entity
 */
export const createProject = async (options: CreateProjectOptions = {}): Promise<Project> => {
  projectCounter++;
  const dataSource = getTestDataSource();
  const repository = dataSource.getRepository(Project);

  // Create or use provided organization
  let organizationId = options.organizationId;
  if (!organizationId && !options.organization) {
    const org = await createOrganization();
    organizationId = org.id;
  } else if (options.organization) {
    organizationId = options.organization.id;
  }

  const project = repository.create({
    name: options.name ?? `Test Project ${projectCounter}`,
    description: options.description ?? `Description for test project ${projectCounter}`,
    organizationId: organizationId!,
    settings: options.settings ?? {},
  } as Partial<Project>);

  return repository.save(project) as Promise<Project>;
};

/**
 * Create multiple test projects
 */
export const createProjects = async (
  count: number,
  options: CreateProjectOptions = {},
): Promise<Project[]> => {
  const projects: Project[] = [];
  for (let i = 0; i < count; i++) {
    projects.push(await createProject(options));
  }
  return projects;
};

/**
 * Reset the project counter (useful between tests)
 */
export const resetProjectCounter = (): void => {
  projectCounter = 0;
};
