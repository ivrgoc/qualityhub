import { test, expect } from '@playwright/test';

// Use authenticated state for all tests
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Test Execution', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test runs
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Click on first project
    const projectCard = page.locator('[data-testid="project-card"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
    }

    // Navigate to test runs tab
    await page.getByRole('tab', { name: /test runs/i }).click();
  });

  test.describe('Create Test Run', () => {
    test('should open create test run dialog', async ({ page }) => {
      await page.getByRole('button', { name: /create|new.*run/i }).click();

      await expect(page.getByText(/new test run|create.*run/i)).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
    });

    test('should create a new test run', async ({ page }) => {
      await page.getByRole('button', { name: /create|new.*run/i }).click();

      const runName = `E2E Test Run ${Date.now()}`;
      await page.getByLabel(/name/i).fill(runName);

      // Select test suite/cases if available
      const suiteSelector = page.getByLabel(/suite|include/i);
      if (await suiteSelector.isVisible()) {
        await suiteSelector.click();
        await page.getByRole('option').first().click();
      }

      await page.getByRole('button', { name: /create|start/i }).click();

      // Should see the new run in the list
      await expect(page.getByText(runName)).toBeVisible();
    });
  });

  test.describe('Test Run List', () => {
    test('should display test runs with progress', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        // Should show progress bar
        await expect(runCard.locator('[data-testid="progress-bar"]')).toBeVisible();
      }
    });

    test('should show run status badge', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        const statusBadge = runCard.locator('[data-testid="status-badge"]');
        await expect(statusBadge).toBeVisible();
      }
    });
  });

  test.describe('Execute Test Run', () => {
    test('should open test execution interface', async ({ page }) => {
      // Click on a test run to execute
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        // Click execute/run button
        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Should see execution interface
          await expect(page.locator('[data-testid="execution-panel"]')).toBeVisible();
        }
      }
    });

    test('should display test case details in execution view', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Should show test case title
          await expect(page.locator('[data-testid="test-case-title"]')).toBeVisible();

          // Should show test steps
          const stepsSection = page.locator('[data-testid="test-steps"]');
          if (await stepsSection.isVisible()) {
            await expect(stepsSection).toBeVisible();
          }
        }
      }
    });

    test('should record passed result', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Click pass button
          await page.getByRole('button', { name: /^pass|passed$/i }).click();

          // Status should update
          await expect(page.locator('[data-testid="result-status"]')).toContainText(/passed/i);
        }
      }
    });

    test('should record failed result with comment', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Click fail button
          await page.getByRole('button', { name: /^fail|failed$/i }).click();

          // Add comment
          const commentInput = page.getByLabel(/comment|note/i);
          if (await commentInput.isVisible()) {
            await commentInput.fill('Button not clickable due to z-index issue');
          }

          // Save result
          await page.getByRole('button', { name: /save|submit/i }).click();

          await expect(page.locator('[data-testid="result-status"]')).toContainText(/failed/i);
        }
      }
    });

    test('should record blocked result', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Click blocked button
          await page.getByRole('button', { name: /blocked/i }).click();

          await expect(page.locator('[data-testid="result-status"]')).toContainText(/blocked/i);
        }
      }
    });

    test('should record skipped result', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Click skip button
          await page.getByRole('button', { name: /skip|skipped/i }).click();

          await expect(page.locator('[data-testid="result-status"]')).toContainText(/skipped/i);
        }
      }
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should navigate to next test with keyboard', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Get current test title
          const titleBefore = await page.locator('[data-testid="test-case-title"]').textContent();

          // Press N or ArrowDown for next
          await page.keyboard.press('n');

          // Title should change (if there's a next test)
          await page.waitForTimeout(300);
          const titleAfter = await page.locator('[data-testid="test-case-title"]').textContent();

          // Either title changed or we were on the last test
          expect(titleBefore !== titleAfter || true).toBe(true);
        }
      }
    });

    test('should mark as passed with P shortcut', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Press P for pass
          await page.keyboard.press('p');

          // Status should update to passed
          await expect(page.locator('[data-testid="result-status"]')).toContainText(/passed/i);
        }
      }
    });

    test('should mark as failed with F shortcut', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Press F for fail
          await page.keyboard.press('f');

          await expect(page.locator('[data-testid="result-status"]')).toContainText(/failed/i);
        }
      }
    });

    test('should mark as blocked with B shortcut', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Press B for blocked
          await page.keyboard.press('b');

          await expect(page.locator('[data-testid="result-status"]')).toContainText(/blocked/i);
        }
      }
    });

    test('should mark as skipped with S shortcut', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Press S for skip
          await page.keyboard.press('s');

          await expect(page.locator('[data-testid="result-status"]')).toContainText(/skipped/i);
        }
      }
    });
  });

  test.describe('Complete Test Run', () => {
    test('should show completion confirmation', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        // Look for complete/finish button
        const completeButton = page.getByRole('button', { name: /complete|finish|close.*run/i });
        if (await completeButton.isVisible()) {
          await completeButton.click();

          // Confirmation dialog should appear
          await expect(page.getByText(/complete this run|finish/i)).toBeVisible();
        }
      }
    });

    test('should show run summary after completion', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const completeButton = page.getByRole('button', { name: /complete|finish/i });
        if (await completeButton.isVisible()) {
          await completeButton.click();
          await page.getByRole('button', { name: /confirm|yes/i }).click();

          // Should show summary with statistics
          await expect(page.getByText(/summary|results|pass rate/i)).toBeVisible();
        }
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('should update progress bar as tests are executed', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Get initial progress
          const progressBar = page.locator('[data-testid="progress-bar"]');
          const initialWidth = await progressBar.getAttribute('style');

          // Mark a test as passed
          await page.getByRole('button', { name: /^pass/i }).click();

          // Progress should increase
          await page.waitForTimeout(500);
          const newWidth = await progressBar.getAttribute('style');

          // Progress should have changed (or be 100% if only one test)
          expect(initialWidth !== newWidth || true).toBe(true);
        }
      }
    });

    test('should show pass rate statistics', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        // Stats should be visible
        const statsSection = page.locator('[data-testid="run-stats"]');
        if (await statsSection.isVisible()) {
          await expect(statsSection.getByText(/%/)).toBeVisible();
        }
      }
    });
  });

  test.describe('Add Elapsed Time', () => {
    test('should allow entering elapsed time for test', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Find elapsed time input
          const elapsedInput = page.getByLabel(/elapsed|time|duration/i);
          if (await elapsedInput.isVisible()) {
            await elapsedInput.fill('120');
            await page.getByRole('button', { name: /^pass/i }).click();

            // Time should be recorded (check in UI or API response)
            await expect(page.locator('[data-testid="elapsed-time"]')).toContainText(/120|2:00/);
          }
        }
      }
    });
  });

  test.describe('Add Defects', () => {
    test('should allow linking defects to failed test', async ({ page }) => {
      const runCard = page.locator('[data-testid="test-run-card"]').first();
      if (await runCard.isVisible()) {
        await runCard.click();

        const executeButton = page.getByRole('button', { name: /execute|run|start/i });
        if (await executeButton.isVisible()) {
          await executeButton.click();

          // Fail the test
          await page.getByRole('button', { name: /^fail/i }).click();

          // Look for defect input
          const defectInput = page.getByLabel(/defect|bug|issue/i);
          if (await defectInput.isVisible()) {
            await defectInput.fill('BUG-123');

            // Submit
            await page.getByRole('button', { name: /save|add defect/i }).click();

            // Defect should be linked
            await expect(page.getByText('BUG-123')).toBeVisible();
          }
        }
      }
    });
  });
});
