import { test, expect } from '@playwright/test';
import {
  TEST_PROJECTS,
  mockAuthenticatedSession,
  mockProjectsEndpoint,
  mockDashboardEndpoint,
  mockCreateProjectEndpoint,
  mockRefreshEndpointFailing,
} from './helpers';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockRefreshEndpointFailing(page);
    await mockProjectsEndpoint(page);
    await mockDashboardEndpoint(page);
  });

  // -----------------------------------------------------------------------
  // Projects list page rendering
  // -----------------------------------------------------------------------
  test.describe('Projects List Page', () => {
    test('should render the page heading and description', async ({ page }) => {
      await page.goto('/projects');

      await expect(
        page.getByRole('heading', { name: /projects/i }),
      ).toBeVisible();
      await expect(
        page.getByText(/manage your test projects/i),
      ).toBeVisible();
    });

    test('should display the "New project" button', async ({ page }) => {
      await page.goto('/projects');

      await expect(
        page.getByRole('button', { name: /new project/i }),
      ).toBeVisible();
    });

    test('should display the search input', async ({ page }) => {
      await page.goto('/projects');

      await expect(
        page.getByPlaceholder(/search projects/i),
      ).toBeVisible();
    });

    test('should render project cards from the API', async ({ page }) => {
      await page.goto('/projects');

      // Both test projects should be visible
      for (const project of TEST_PROJECTS) {
        await expect(page.getByText(project.name)).toBeVisible();
      }
    });

    test('should display the refresh button', async ({ page }) => {
      await page.goto('/projects');

      await expect(
        page.getByRole('button', { name: /refresh/i }),
      ).toBeVisible();
    });
  });

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  test.describe('Empty State', () => {
    test('should show empty state when no projects exist', async ({ page }) => {
      // Override the projects mock to return an empty list
      await page.route('**/api/v1/projects*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [],
            total: 0,
            page: 1,
            pageSize: 25,
            totalPages: 0,
          }),
        }),
      );

      await page.goto('/projects');

      await expect(page.getByText(/no projects yet/i)).toBeVisible();
      await expect(
        page.getByText(/create your first project/i),
      ).toBeVisible();

      // The inline "Create project" button in the empty state
      await expect(
        page.getByRole('button', { name: /create project/i }),
      ).toBeVisible();
    });
  });

  // -----------------------------------------------------------------------
  // Create project dialog
  // -----------------------------------------------------------------------
  test.describe('Create Project Dialog', () => {
    test('should open the create project dialog', async ({ page }) => {
      await page.goto('/projects');

      await page.getByRole('button', { name: /new project/i }).click();

      // The dialog should be visible with a name input
      await expect(page.getByLabel(/name/i)).toBeVisible();
    });

    test('should close the dialog on cancel / escape', async ({ page }) => {
      await page.goto('/projects');

      await page.getByRole('button', { name: /new project/i }).click();
      await expect(page.getByLabel(/name/i)).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');

      // The name input inside the dialog should no longer be visible
      await expect(page.getByLabel(/name/i)).not.toBeVisible();
    });

    test('should create a project via the dialog', async ({ page }) => {
      await mockCreateProjectEndpoint(page);
      await page.goto('/projects');

      await page.getByRole('button', { name: /new project/i }).click();

      await page.getByLabel(/name/i).fill('New Smoke Project');

      // Fill description if the field exists
      const descriptionField = page.getByLabel(/description/i);
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('Created via E2E test');
      }

      // Submit the form
      await page.getByRole('button', { name: /create|save/i }).click();

      // After creation the app navigates to the new project detail page
      await expect(page).toHaveURL(/\/projects\/proj_/);
    });
  });
});
