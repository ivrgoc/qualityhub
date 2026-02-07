import { test, expect } from '@playwright/test';
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  mockProjectsEndpoint,
  mockDashboardEndpoint,
  mockRefreshEndpointFailing,
  mockLogoutEndpoint,
  TEST_PROJECTS,
} from './helpers';

test.describe('Navigation', () => {
  // -----------------------------------------------------------------------
  // Unauthenticated redirect behaviour
  // -----------------------------------------------------------------------
  test.describe('Unauthenticated Access', () => {
    test.beforeEach(async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
    });

    test('should redirect /dashboard to /login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect /projects to /login', async ({ page }) => {
      await page.goto('/projects');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect /settings to /login', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow access to /login without redirect', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
      await expect(
        page.getByRole('heading', { name: /sign in/i }),
      ).toBeVisible();
    });

    test('should allow access to /register without redirect', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveURL(/\/register/);
      await expect(
        page.getByRole('heading', { name: /create your account/i }),
      ).toBeVisible();
    });
  });

  // -----------------------------------------------------------------------
  // Authenticated sidebar navigation
  // -----------------------------------------------------------------------
  test.describe('Sidebar Navigation (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await mockProjectsEndpoint(page);
      await mockDashboardEndpoint(page);
      await mockLogoutEndpoint(page);
    });

    test('should display the sidebar with brand and nav items', async ({ page }) => {
      await page.goto('/dashboard');

      // Brand / logo link
      await expect(page.getByRole('link', { name: /qualityhub/i })).toBeVisible();

      // Global nav items
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /projects/i })).toBeVisible();

      // Bottom nav
      await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
    });

    test('should navigate to the dashboard page', async ({ page }) => {
      await page.goto('/projects');
      await page.getByRole('link', { name: /dashboard/i }).click();

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(
        page.getByRole('heading', { name: /dashboard/i }),
      ).toBeVisible();
    });

    test('should navigate to the projects page', async ({ page }) => {
      await page.goto('/dashboard');
      await page.getByRole('link', { name: /projects/i }).click();

      await expect(page).toHaveURL(/\/projects/);
      await expect(
        page.getByRole('heading', { name: /projects/i }),
      ).toBeVisible();
    });

    test('should display project-scoped navigation when projects exist', async ({ page }) => {
      await page.goto('/dashboard');

      // The sidebar should show project-scoped nav items
      // (derived from the first project returned by the API)
      await expect(page.getByRole('link', { name: /test cases/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /test runs/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /milestones/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /requirements/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /reports/i })).toBeVisible();
    });

    test('should show the project switcher with loaded projects', async ({ page }) => {
      await page.goto('/dashboard');

      // The project switcher should display the current (first) project name
      const firstProjectName = TEST_PROJECTS[0].name;
      await expect(page.getByText(firstProjectName)).toBeVisible();
    });

    test('should display the user section in the sidebar', async ({ page }) => {
      await page.goto('/dashboard');

      // User name and email should be visible in the sidebar
      await expect(page.getByText('QA Tester')).toBeVisible();
      await expect(page.getByText('qa@qualityhub.test')).toBeVisible();
    });
  });

  // -----------------------------------------------------------------------
  // Authenticated user visiting guest routes
  // -----------------------------------------------------------------------
  test.describe('Authenticated User on Guest Routes', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await mockProjectsEndpoint(page);
      await mockDashboardEndpoint(page);
    });

    test('should redirect /login to /dashboard for authenticated user', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should redirect /register to /dashboard for authenticated user', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
