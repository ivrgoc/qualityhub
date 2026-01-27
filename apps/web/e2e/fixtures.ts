import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Extended test fixtures for QualityHub E2E tests.
 */

// Test data types
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export interface TestProject {
  name: string;
  description?: string;
}

export interface TestCase {
  title: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  templateType?: 'steps' | 'text' | 'bdd' | 'exploratory';
}

// Custom fixtures
interface CustomFixtures {
  authenticatedPage: Page;
  testUser: TestUser;
  testProject: TestProject;
  testCase: TestCase;
}

/**
 * Extended test with custom fixtures.
 */
export const test = base.extend<CustomFixtures>({
  // Default test user
  testUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  },

  // Default test project
  testProject: {
    name: 'E2E Test Project',
    description: 'Project created for E2E testing',
  },

  // Default test case
  testCase: {
    title: 'E2E Test Case',
    priority: 'medium',
    templateType: 'steps',
  },

  // Pre-authenticated page
  authenticatedPage: async ({ browser, testUser }, use) => {
    // Create a new context
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });

    // Create a new page
    const page = await context.newPage();

    // Navigate to dashboard to verify auth
    await page.goto('/dashboard');

    // Provide the page to the test
    await use(page);

    // Cleanup
    await context.close();
  },
});

export { expect };

/**
 * Page Object Model: Login Page
 */
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign in|login/i }).click();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

/**
 * Page Object Model: Dashboard Page
 */
export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async getStatsCards() {
    return this.page.locator('[data-testid="stats-card"]').all();
  }
}

/**
 * Page Object Model: Projects Page
 */
export class ProjectsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/projects');
  }

  async createProject(name: string, description?: string) {
    await this.page.getByRole('button', { name: /create|new project/i }).click();
    await this.page.getByLabel(/name/i).fill(name);
    if (description) {
      await this.page.getByLabel(/description/i).fill(description);
    }
    await this.page.getByRole('button', { name: /create|save/i }).click();
  }

  async openProject(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}

/**
 * Page Object Model: Test Cases Page
 */
export class TestCasesPage {
  constructor(private page: Page) {}

  async goto(projectId: string) {
    await this.page.goto(`/projects/${projectId}/test-cases`);
  }

  async createTestCase(title: string, options?: { priority?: string }) {
    await this.page.getByRole('button', { name: /create|new test case/i }).click();
    await this.page.getByLabel(/title/i).fill(title);
    if (options?.priority) {
      await this.page.getByLabel(/priority/i).selectOption(options.priority);
    }
    await this.page.getByRole('button', { name: /create|save/i }).click();
  }

  async selectTestCase(title: string) {
    await this.page.getByText(title).click();
  }

  async deleteTestCase(title: string) {
    await this.selectTestCase(title);
    await this.page.getByRole('button', { name: /delete/i }).click();
    await this.page.getByRole('button', { name: /confirm|yes/i }).click();
  }
}

/**
 * Page Object Model: Test Execution Page
 */
export class TestExecutionPage {
  constructor(private page: Page) {}

  async goto(projectId: string, runId: string) {
    await this.page.goto(`/projects/${projectId}/runs/${runId}/execute`);
  }

  async recordResult(status: 'passed' | 'failed' | 'blocked' | 'skipped') {
    await this.page.getByRole('button', { name: new RegExp(status, 'i') }).click();
  }

  async addComment(comment: string) {
    await this.page.getByLabel(/comment/i).fill(comment);
  }

  async nextTest() {
    await this.page.getByRole('button', { name: /next/i }).click();
  }

  async previousTest() {
    await this.page.getByRole('button', { name: /previous/i }).click();
  }
}
