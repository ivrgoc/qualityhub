import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Organization } from '../../modules/organizations/entities/organization.entity';
import { getTestDataSource } from '../test-database';
import { createOrganization } from './organization.factory';

let userCounter = 0;
const DEFAULT_PASSWORD = 'TestPassword123!';

export interface CreateUserOptions {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  organizationId?: string;
  organization?: Organization;
  settings?: Record<string, unknown> | null;
}

/**
 * Create a test user entity
 */
export const createUser = async (options: CreateUserOptions = {}): Promise<User> => {
  userCounter++;
  const dataSource = getTestDataSource();
  const repository = dataSource.getRepository(User);

  // Create or use provided organization
  let organizationId = options.organizationId;
  if (!organizationId && !options.organization) {
    const org = await createOrganization();
    organizationId = org.id;
  } else if (options.organization) {
    organizationId = options.organization.id;
  }

  const passwordHash = await bcrypt.hash(options.password ?? DEFAULT_PASSWORD, 10);

  const user = repository.create({
    email: options.email ?? `testuser${userCounter}@example.com`,
    passwordHash,
    name: options.name ?? `Test User ${userCounter}`,
    role: options.role ?? UserRole.TESTER,
    organizationId: organizationId!,
    settings: options.settings ?? null,
  });

  return repository.save(user);
};

/**
 * Create a user with admin role
 */
export const createAdminUser = async (
  options: Omit<CreateUserOptions, 'role'> = {},
): Promise<User> => {
  return createUser({ ...options, role: UserRole.ORG_ADMIN });
};

/**
 * Create a user with project admin role
 */
export const createProjectAdminUser = async (
  options: Omit<CreateUserOptions, 'role'> = {},
): Promise<User> => {
  return createUser({ ...options, role: UserRole.PROJECT_ADMIN });
};

/**
 * Create multiple test users
 */
export const createUsers = async (
  count: number,
  options: CreateUserOptions = {},
): Promise<User[]> => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    users.push(await createUser(options));
  }
  return users;
};

/**
 * Reset the user counter (useful between tests)
 */
export const resetUserCounter = (): void => {
  userCounter = 0;
};

/**
 * Get the default test password (useful for login tests)
 */
export const getDefaultPassword = (): string => DEFAULT_PASSWORD;
