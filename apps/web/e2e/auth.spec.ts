import { test, expect } from '@playwright/test';
import {
  TEST_USER,
  mockLoginEndpoint,
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  mockProjectsEndpoint,
  mockDashboardEndpoint,
  mockRefreshEndpointFailing,
} from './helpers';

test.describe('Authentication Flows', () => {
  // -----------------------------------------------------------------------
  // Login page rendering
  // -----------------------------------------------------------------------
  test.describe('Login Page', () => {
    test('should render all login form elements', async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await page.goto('/login');

      // Heading
      await expect(
        page.getByRole('heading', { name: /sign in to qualityhub/i }),
      ).toBeVisible();

      // Form fields
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();

      // Actions
      await expect(
        page.getByRole('button', { name: /sign in/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: /forgot password/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: /sign up/i }),
      ).toBeVisible();
    });

    test('should have email field focused by default', async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await page.goto('/login');

      await expect(page.getByLabel(/email/i)).toBeFocused();
    });
  });

  // -----------------------------------------------------------------------
  // Client-side validation
  // -----------------------------------------------------------------------
  test.describe('Login Validation', () => {
    test.beforeEach(async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await page.goto('/login');
    });

    test('should show error when email is empty', async ({ page }) => {
      // Leave email empty, fill password, submit
      await page.getByLabel(/password/i).fill('SomePassword1!');
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.getByLabel(/email/i).fill('not-an-email');
      await page.getByLabel(/password/i).fill('SomePassword1!');
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(
        page.getByText(/please enter a valid email address/i),
      ).toBeVisible();
    });

    test('should show error when password is empty', async ({ page }) => {
      await page.getByLabel(/email/i).fill('user@example.com');
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test('should clear email error when user starts typing', async ({ page }) => {
      // Trigger the error first
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page.getByText(/email is required/i)).toBeVisible();

      // Start typing in the email field
      await page.getByLabel(/email/i).fill('a');

      // Error should be cleared
      await expect(page.getByText(/email is required/i)).not.toBeVisible();
    });
  });

  // -----------------------------------------------------------------------
  // Login with credentials (API mocked)
  // -----------------------------------------------------------------------
  test.describe('Login Submission', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await mockLoginEndpoint(page);
      await mockAuthenticatedSession(page);
      await mockDashboardEndpoint(page);
      await mockProjectsEndpoint(page);

      // We need to override the unauthenticated mock after login succeeds.
      // The mockLoginEndpoint will return a token; the app stores it in
      // localStorage and then navigates. On the dashboard page, the
      // mockAuthenticatedSession route for /auth/me will respond.

      await page.goto('/login');

      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByLabel(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show error for wrong credentials', async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await mockLoginEndpoint(page);

      await page.goto('/login');

      await page.getByLabel(/email/i).fill('wrong@example.com');
      await page.getByLabel(/password/i).fill('WrongPassword1!');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should show the API error message
      await expect(
        page.getByText(/invalid email or password/i),
      ).toBeVisible();

      // Should remain on the login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should toggle password visibility', async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
      await page.goto('/login');

      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click the show password button
      await page.getByRole('button', { name: /show password/i }).click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await page.getByRole('button', { name: /hide password/i }).click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  // -----------------------------------------------------------------------
  // Navigation links
  // -----------------------------------------------------------------------
  test.describe('Auth Navigation Links', () => {
    test.beforeEach(async ({ page }) => {
      await mockUnauthenticatedSession(page);
      await mockRefreshEndpointFailing(page);
    });

    test('should navigate from login to register', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: /sign up/i }).click();

      await expect(page).toHaveURL(/\/register/);
    });

    test('should navigate from login to forgot password', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: /forgot password/i }).click();

      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('should navigate from register to login', async ({ page }) => {
      await page.goto('/register');
      await page.getByRole('link', { name: /sign in/i }).click();

      await expect(page).toHaveURL(/\/login/);
    });
  });
});
