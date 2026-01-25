import { Organization, OrganizationPlan } from './organization.entity';
import { User, UserRole } from '../../users/entities/user.entity';

describe('Organization Entity', () => {
  it('should create an organization instance', () => {
    const organization = new Organization();

    organization.id = 'org-123';
    organization.name = 'Test Organization';
    organization.slug = 'test-org';
    organization.settings = null;
    organization.plan = OrganizationPlan.FREE;
    organization.createdAt = new Date('2024-01-01');

    expect(organization.id).toBe('org-123');
    expect(organization.name).toBe('Test Organization');
    expect(organization.slug).toBe('test-org');
    expect(organization.settings).toBeNull();
    expect(organization.plan).toBe(OrganizationPlan.FREE);
    expect(organization.createdAt).toEqual(new Date('2024-01-01'));
  });

  describe('OrganizationPlan enum', () => {
    it('should have all expected plans', () => {
      expect(OrganizationPlan.FREE).toBe('free');
      expect(OrganizationPlan.STARTER).toBe('starter');
      expect(OrganizationPlan.PROFESSIONAL).toBe('professional');
      expect(OrganizationPlan.ENTERPRISE).toBe('enterprise');
    });
  });

  it('should support settings as a JSON object', () => {
    const organization = new Organization();
    const settings = {
      maxUsers: 10,
      features: ['ai-generation', 'integrations'],
      branding: { logo: 'logo.png' },
    };

    organization.settings = settings;

    expect(organization.settings).toEqual(settings);
    expect(organization.settings.maxUsers).toBe(10);
  });

  it('should have users relation', () => {
    const organization = new Organization();
    organization.id = 'org-123';
    organization.name = 'Test Organization';
    organization.slug = 'test-org';

    const user1 = new User();
    user1.id = 'user-1';
    user1.email = 'user1@example.com';
    user1.name = 'User One';
    user1.role = UserRole.TESTER;

    const user2 = new User();
    user2.id = 'user-2';
    user2.email = 'user2@example.com';
    user2.name = 'User Two';
    user2.role = UserRole.LEAD;

    organization.users = [user1, user2];

    expect(organization.users).toHaveLength(2);
    expect(organization.users[0].id).toBe('user-1');
    expect(organization.users[1].id).toBe('user-2');
  });
});
