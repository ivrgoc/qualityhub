import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

/**
 * Authentication setup for Playwright tests.
 * Logs in a test user and saves the authenticated state.
 * Other tests can then use this state to skip login.
 */
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('TestPassword123!');

  // Click login button
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Ensure user is logged in
  await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

/**
 * Test to verify authentication is working correctly.
 */
setup('verify auth state', async ({ page }) => {
  // Load saved auth state
  await page.context().storageState();

  // Go to dashboard
  await page.goto('/dashboard');

  // Should be authenticated and stay on dashboard
  await expect(page).not.toHaveURL(/login/);
});
