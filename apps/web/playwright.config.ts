import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for QualityHub E2E tests.
 *
 * Configured for fast smoke testing with Chromium only.
 * API calls are mocked via page.route() so no backend is required.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory containing test files
  testDir: './e2e',

  // Maximum time one test can run
  timeout: 30_000,

  // Maximum time expect() should wait for the condition
  expect: {
    timeout: 5_000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  // Shared settings for all projects
  use: {
    // Base URL for the Vite dev server
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Accept downloads
    acceptDownloads: true,
  },

  // Chromium only for speed during development
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Uncomment to start the Vite dev server automatically before tests.
  // Requires the dev server to not already be running.
  // webServer: {
  //   command: 'pnpm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,
  // },

  // Output folder for test artifacts
  outputDir: 'test-results/',
});
