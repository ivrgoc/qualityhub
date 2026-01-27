import { test, expect } from '@playwright/test';
import { LoginPage } from './fixtures';

test.describe('Authentication Flows', () => {
  test.describe('Login', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login');

      // Check page elements are visible
      await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /sign up|register/i })).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('test@example.com', 'TestPassword123!');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should show error for invalid email', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('Password123!');
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Should show validation error
      await expect(page.getByText(/valid email|invalid email/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('wrong@example.com', 'WrongPassword123!');

      // Should show error message
      await expect(page.getByText(/invalid credentials|incorrect/i)).toBeVisible();

      // Should stay on login page
      await expect(page).toHaveURL(/login/);
    });

    test('should show error for empty password', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Should show validation error
      await expect(page.getByText(/password.*required/i)).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /forgot password/i }).click();

      await expect(page).toHaveURL(/forgot-password/);
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /sign up|register|create account/i }).click();

      await expect(page).toHaveURL(/register/);
    });

    test('should persist login state', async ({ page, context }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('test@example.com', 'TestPassword123!');

      // Wait for redirect
      await expect(page).toHaveURL(/dashboard/);

      // Open new page in same context
      const newPage = await context.newPage();
      await newPage.goto('/dashboard');

      // Should still be authenticated
      await expect(newPage).not.toHaveURL(/login/);
    });
  });

  test.describe('Registration', () => {
    test('should display registration page correctly', async ({ page }) => {
      await page.goto('/register');

      // Check page elements are visible
      await expect(page.getByRole('heading', { name: /sign up|register|create account/i })).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/organization/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible();
    });

    test('should register successfully with valid data', async ({ page }) => {
      await page.goto('/register');

      // Fill in registration form
      await page.getByLabel(/name/i).first().fill('New Test User');
      await page.getByLabel(/email/i).fill(`test${Date.now()}@example.com`);
      await page.getByLabel(/organization/i).fill('Test Organization');
      await page.getByLabel(/password/i).fill('SecurePassword123!');

      await page.getByRole('button', { name: /sign up|register|create/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/name/i).first().fill('Test User');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/organization/i).fill('Test Org');
      await page.getByLabel(/password/i).fill('weak');

      await page.getByRole('button', { name: /sign up|register|create/i }).click();

      // Should show password validation error
      await expect(page.getByText(/at least 12|password.*short|password.*weak/i)).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register');

      await page.getByLabel(/name/i).first().fill('Test User');
      await page.getByLabel(/email/i).fill('existing@example.com');
      await page.getByLabel(/organization/i).fill('Test Org');
      await page.getByLabel(/password/i).fill('SecurePassword123!');

      await page.getByRole('button', { name: /sign up|register|create/i }).click();

      // Should show error message
      await expect(page.getByText(/already exists|already registered/i)).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/register');

      await page.getByRole('link', { name: /sign in|login|already have/i }).click();

      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Forgot Password', () => {
    test('should display forgot password page correctly', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.getByRole('heading', { name: /forgot|reset|recover/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|reset|recover/i })).toBeVisible();
    });

    test('should show success message after submitting email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByRole('button', { name: /send|reset|recover/i }).click();

      // Should show success message
      await expect(page.getByText(/email sent|check your email|instructions sent/i)).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByRole('button', { name: /send|reset|recover/i }).click();

      // Should show validation error
      await expect(page.getByText(/valid email|invalid email/i)).toBeVisible();
    });

    test('should navigate back to login', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.getByRole('link', { name: /back|login|sign in/i }).click();

      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Logout', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('should logout successfully', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for dashboard to load
      await expect(page).toHaveURL(/dashboard/);

      // Open user menu and click logout
      await page.getByRole('button', { name: /user menu|profile|avatar/i }).click();
      await page.getByRole('menuitem', { name: /logout|sign out/i }).click();

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test('should not access protected routes after logout', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/dashboard/);

      // Logout
      await page.getByRole('button', { name: /user menu|profile|avatar/i }).click();
      await page.getByRole('menuitem', { name: /logout|sign out/i }).click();

      // Try to access protected route
      await page.goto('/projects');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Route Protection', () => {
    test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
      // Clear any existing auth
      await page.context().clearCookies();

      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect unauthenticated user from projects to login', async ({ page }) => {
      await page.context().clearCookies();

      await page.goto('/projects');

      await expect(page).toHaveURL(/login/);
    });

    test('should redirect authenticated user from login to dashboard', async ({ page }) => {
      // Use authenticated state
      await page.context().storageState({ path: 'playwright/.auth/user.json' });

      await page.goto('/login');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/dashboard/);
    });
  });
});
