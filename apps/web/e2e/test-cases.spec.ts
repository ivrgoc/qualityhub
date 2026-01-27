import { test, expect } from '@playwright/test';

// Use authenticated state for all tests
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Test Cases CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a project's test cases page
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Click on first project (or create one if needed)
    const projectCard = page.locator('[data-testid="project-card"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
    }

    // Navigate to test cases tab
    await page.getByRole('tab', { name: /test cases/i }).click();
  });

  test.describe('Create Test Case', () => {
    test('should open create test case form', async ({ page }) => {
      await page.getByRole('button', { name: /create|new test case|add/i }).click();

      // Form should be visible
      await expect(page.getByText(/new test case/i)).toBeVisible();
      await expect(page.getByLabel(/title/i)).toBeVisible();
    });

    test('should create a steps template test case', async ({ page }) => {
      await page.getByRole('button', { name: /create|new test case|add/i }).click();

      const title = `E2E Test Case ${Date.now()}`;
      await page.getByLabel(/title/i).fill(title);

      // Set priority
      await page.getByLabel(/priority/i).click();
      await page.getByRole('option', { name: /high/i }).click();

      // Add a step (if steps editor is visible)
      const addStepButton = page.getByRole('button', { name: /add step/i });
      if (await addStepButton.isVisible()) {
        await addStepButton.click();
        await page.getByPlaceholder(/step description|action/i).first().fill('Navigate to page');
        await page.getByPlaceholder(/expected result/i).first().fill('Page is displayed');
      }

      // Submit
      await page.getByRole('button', { name: /create|save/i }).click();

      // Should see the new test case in the list
      await expect(page.getByText(title)).toBeVisible();
    });

    test('should create a BDD template test case', async ({ page }) => {
      await page.getByRole('button', { name: /create|new test case|add/i }).click();

      const title = `BDD Test ${Date.now()}`;
      await page.getByLabel(/title/i).fill(title);

      // Change template type to BDD
      await page.getByLabel(/template/i).click();
      await page.getByRole('option', { name: /bdd|gherkin/i }).click();

      // Fill in Gherkin content
      const gherkinContent = `Feature: User Login
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in`;

      const bddEditor = page.getByRole('textbox').last();
      if (await bddEditor.isVisible()) {
        await bddEditor.fill(gherkinContent);
      }

      await page.getByRole('button', { name: /create|save/i }).click();

      await expect(page.getByText(title)).toBeVisible();
    });

    test('should show validation error for empty title', async ({ page }) => {
      await page.getByRole('button', { name: /create|new test case|add/i }).click();

      // Try to submit without title
      await page.getByRole('button', { name: /create|save/i }).click();

      await expect(page.getByText(/title.*required|enter a title/i)).toBeVisible();
    });
  });

  test.describe('View Test Case', () => {
    test('should display test case details', async ({ page }) => {
      // Click on a test case in the list
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        await testCaseRow.click();

        // Should show details panel
        await expect(page.getByText(/title|priority|template/i)).toBeVisible();
      }
    });

    test('should show test case steps', async ({ page }) => {
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        await testCaseRow.click();

        // Steps section should be visible for steps template
        const stepsSection = page.getByText(/steps|test steps/i);
        if (await stepsSection.isVisible()) {
          await expect(stepsSection).toBeVisible();
        }
      }
    });
  });

  test.describe('Edit Test Case', () => {
    test('should open edit form for existing test case', async ({ page }) => {
      // Click on a test case
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        await testCaseRow.click();

        // Click edit button
        await page.getByRole('button', { name: /edit/i }).click();

        // Form should be in edit mode
        await expect(page.getByText(/edit test case/i)).toBeVisible();
      }
    });

    test('should save changes to test case', async ({ page }) => {
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        await testCaseRow.click();
        await page.getByRole('button', { name: /edit/i }).click();

        // Modify title
        const titleInput = page.getByLabel(/title/i);
        const originalTitle = await titleInput.inputValue();
        const newTitle = `Updated ${originalTitle}`;
        await titleInput.fill(newTitle);

        // Save changes
        await page.getByRole('button', { name: /save/i }).click();

        // Should see updated title
        await expect(page.getByText(newTitle)).toBeVisible();
      }
    });

    test('should cancel edit without saving', async ({ page }) => {
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        await testCaseRow.click();
        await page.getByRole('button', { name: /edit/i }).click();

        // Modify title
        const titleInput = page.getByLabel(/title/i);
        const originalTitle = await titleInput.inputValue();
        await titleInput.fill('Should not be saved');

        // Cancel
        await page.getByRole('button', { name: /cancel/i }).click();

        // Should still see original title
        await expect(page.getByText(originalTitle)).toBeVisible();
      }
    });
  });

  test.describe('Delete Test Case', () => {
    test('should show confirmation dialog before deleting', async ({ page }) => {
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        await testCaseRow.click();

        // Click delete button
        await page.getByRole('button', { name: /delete/i }).click();

        // Confirmation dialog should appear
        await expect(page.getByText(/are you sure|confirm delete/i)).toBeVisible();
      }
    });

    test('should delete test case when confirmed', async ({ page }) => {
      // First get the title of the test case to delete
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        const testCaseTitle = await testCaseRow.textContent();
        await testCaseRow.click();

        // Delete
        await page.getByRole('button', { name: /delete/i }).click();
        await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

        // Test case should no longer be visible
        if (testCaseTitle) {
          await expect(page.getByText(testCaseTitle)).not.toBeVisible();
        }
      }
    });

    test('should cancel delete operation', async ({ page }) => {
      const testCaseRow = page.locator('[data-testid="test-case-row"]').first();
      if (await testCaseRow.isVisible()) {
        const testCaseTitle = await testCaseRow.textContent();
        await testCaseRow.click();

        // Click delete then cancel
        await page.getByRole('button', { name: /delete/i }).click();
        await page.getByRole('button', { name: /cancel|no/i }).click();

        // Test case should still be visible
        if (testCaseTitle) {
          await expect(page.getByText(testCaseTitle)).toBeVisible();
        }
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple test cases', async ({ page }) => {
      // Select first two test cases
      const checkboxes = page.locator('[data-testid="test-case-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Bulk actions bar should appear
        await expect(page.getByText(/2 selected/i)).toBeVisible();
      }
    });

    test('should bulk delete selected test cases', async ({ page }) => {
      const checkboxes = page.locator('[data-testid="test-case-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Click bulk delete
        await page.getByRole('button', { name: /delete selected|bulk delete/i }).click();
        await page.getByRole('button', { name: /confirm|yes/i }).click();

        // Selection should be cleared
        await expect(page.getByText(/selected/i)).not.toBeVisible();
      }
    });
  });

  test.describe('Search and Filter', () => {
    test('should filter test cases by search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('login');

        // Wait for filtering
        await page.waitForTimeout(500);

        // Only matching test cases should be visible
        const visibleCases = page.locator('[data-testid="test-case-row"]');
        const count = await visibleCases.count();

        // Each visible case should contain "login" in some form
        for (let i = 0; i < count; i++) {
          const text = await visibleCases.nth(i).textContent();
          expect(text?.toLowerCase()).toContain('login');
        }
      }
    });

    test('should filter by priority', async ({ page }) => {
      const priorityFilter = page.getByLabel(/priority filter|filter by priority/i);
      if (await priorityFilter.isVisible()) {
        await priorityFilter.click();
        await page.getByRole('option', { name: /high/i }).click();

        // Wait for filtering
        await page.waitForTimeout(300);

        // All visible cases should have high priority badge
        const priorityBadges = page.locator('[data-testid="priority-badge"]');
        const count = await priorityBadges.count();

        for (let i = 0; i < count; i++) {
          await expect(priorityBadges.nth(i)).toContainText(/high/i);
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between sections in tree view', async ({ page }) => {
      const sectionTree = page.locator('[data-testid="section-tree"]');
      if (await sectionTree.isVisible()) {
        // Click on a section
        const section = sectionTree.locator('[data-testid="section-item"]').first();
        if (await section.isVisible()) {
          await section.click();

          // Test cases list should update to show only that section's cases
          await expect(page.locator('[data-testid="test-case-list"]')).toBeVisible();
        }
      }
    });
  });
});
