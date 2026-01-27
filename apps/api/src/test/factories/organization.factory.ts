import { Organization, OrganizationPlan } from '../../modules/organizations/entities/organization.entity';
import { getTestDataSource } from '../test-database';

let organizationCounter = 0;

export interface CreateOrganizationOptions {
  name?: string;
  slug?: string;
  plan?: OrganizationPlan;
  settings?: Record<string, unknown> | null;
}

/**
 * Create a test organization entity
 */
export const createOrganization = async (
  options: CreateOrganizationOptions = {},
): Promise<Organization> => {
  organizationCounter++;
  const dataSource = getTestDataSource();
  const repository = dataSource.getRepository(Organization);

  const organization = repository.create({
    name: options.name ?? `Test Organization ${organizationCounter}`,
    slug: options.slug ?? `test-org-${organizationCounter}`,
    plan: options.plan ?? OrganizationPlan.FREE,
    settings: options.settings ?? null,
  });

  return repository.save(organization);
};

/**
 * Create multiple test organizations
 */
export const createOrganizations = async (
  count: number,
  options: CreateOrganizationOptions = {},
): Promise<Organization[]> => {
  const organizations: Organization[] = [];
  for (let i = 0; i < count; i++) {
    organizations.push(await createOrganization(options));
  }
  return organizations;
};

/**
 * Reset the organization counter (useful between tests)
 */
export const resetOrganizationCounter = (): void => {
  organizationCounter = 0;
};
