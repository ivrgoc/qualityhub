import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTestCaseDto } from './create-test-case.dto';
import { TestCaseTemplate, Priority } from '../entities/test-case.entity';

describe('CreateTestCaseDto', () => {
  const collectErrors = (errors: import('class-validator').ValidationError[]): string[] => {
    const result: string[] = [];
    for (const error of errors) {
      if (error.constraints) {
        result.push(...Object.values(error.constraints));
      }
      if (error.children && error.children.length > 0) {
        result.push(...collectErrors(error.children));
      }
    }
    return result;
  };

  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: CreateTestCaseDto; errors: string[] }> => {
    const instance = plainToInstance(CreateTestCaseDto, plain);
    const validationErrors = await validate(instance);
    const errors = collectErrors(validationErrors);
    return { instance, errors };
  };

  const validStep = {
    stepNumber: 1,
    action: 'Click the login button',
    expectedResult: 'Login form is displayed',
    data: 'Use test credentials',
  };

  const validData = {
    title: 'Login with valid credentials',
    templateType: TestCaseTemplate.STEPS,
    preconditions: 'User is on login page',
    steps: [validStep],
    expectedResult: 'User is logged in successfully',
    priority: Priority.HIGH,
    estimate: 5,
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.title).toBe('Login with valid credentials');
      expect(instance.templateType).toBe(TestCaseTemplate.STEPS);
      expect(instance.priority).toBe(Priority.HIGH);
    });

    it('should pass validation with only required title', async () => {
      const { errors } = await transformAndValidate({
        title: 'Minimal test case',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with title and steps', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test with steps',
        steps: [
          { stepNumber: 1, action: 'First step' },
          { stepNumber: 2, action: 'Second step' },
        ],
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('title validation', () => {
    it('should accept title with exactly 3 characters', async () => {
      const { errors } = await transformAndValidate({
        title: 'ABC',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept title with exactly 500 characters', async () => {
      const { errors } = await transformAndValidate({
        title: 'A'.repeat(500),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject title shorter than 3 characters', async () => {
      const { errors } = await transformAndValidate({
        title: 'AB',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject title longer than 500 characters', async () => {
      const { errors } = await transformAndValidate({
        title: 'A'.repeat(501),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty title', async () => {
      const { errors } = await transformAndValidate({
        title: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing title', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string title', async () => {
      const { errors } = await transformAndValidate({
        title: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('templateType validation', () => {
    it('should accept valid STEPS template type', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        templateType: TestCaseTemplate.STEPS,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid TEXT template type', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        templateType: TestCaseTemplate.TEXT,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid BDD template type', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        templateType: TestCaseTemplate.BDD,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid EXPLORATORY template type', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        templateType: TestCaseTemplate.EXPLORATORY,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid template type', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        templateType: 'invalid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('priority validation', () => {
    it('should accept valid CRITICAL priority', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        priority: Priority.CRITICAL,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid HIGH priority', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        priority: Priority.HIGH,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid MEDIUM priority', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        priority: Priority.MEDIUM,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid LOW priority', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        priority: Priority.LOW,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid priority', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        priority: 'urgent',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('preconditions validation', () => {
    it('should accept valid preconditions', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        preconditions: 'User is logged in',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty preconditions', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        preconditions: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string preconditions', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        preconditions: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('expectedResult validation', () => {
    it('should accept valid expectedResult', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        expectedResult: 'User is redirected to dashboard',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty expectedResult', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        expectedResult: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string expectedResult', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        expectedResult: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('estimate validation', () => {
    it('should accept valid estimate', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        estimate: 5,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept zero estimate', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        estimate: 0,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-number estimate', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        estimate: 'five',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('steps nested validation', () => {
    it('should accept valid steps array', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [
          { stepNumber: 1, action: 'Click login button' },
          { stepNumber: 2, action: 'Enter username' },
          { stepNumber: 3, action: 'Enter password' },
        ],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty steps array', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept steps with all optional fields', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [
          {
            stepNumber: 1,
            action: 'Click login button',
            expectedResult: 'Login form appears',
            data: 'Test data',
          },
        ],
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-array steps', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: 'not an array',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps with missing stepNumber', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ action: 'Click button' }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps with missing action', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ stepNumber: 1 }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps with invalid stepNumber', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ stepNumber: 0, action: 'Click button' }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps with empty action', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ stepNumber: 1, action: '' }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps array exceeding max size', async () => {
      const steps = Array.from({ length: 101 }, (_, i) => ({
        stepNumber: i + 1,
        action: `Step ${i + 1}`,
      }));
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept steps array at max size', async () => {
      const steps = Array.from({ length: 100 }, (_, i) => ({
        stepNumber: i + 1,
        action: `Step ${i + 1}`,
      }));
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject steps with action exceeding max length', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ stepNumber: 1, action: 'A'.repeat(2001) }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps with non-numeric stepNumber type', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ stepNumber: 'one', action: 'Click button' }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject steps with negative stepNumber', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [{ stepNumber: -1, action: 'Click button' }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate all nested steps and report errors', async () => {
      const { errors } = await transformAndValidate({
        title: 'Test case',
        steps: [
          { stepNumber: 1, action: 'Valid step' },
          { stepNumber: 0, action: '' },
          { stepNumber: 3, action: 'Another valid step' },
        ],
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        title: 'AB',
        templateType: 'invalid',
        priority: 'invalid',
        estimate: 'not a number',
        steps: [{ stepNumber: 0, action: '' }],
      });
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should reject invalid nested values even when parent fields are valid', async () => {
      const { errors } = await transformAndValidate({
        title: 'Valid Title',
        templateType: TestCaseTemplate.STEPS,
        priority: Priority.HIGH,
        steps: [{ stepNumber: 'invalid', action: 12345 }],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should transform and validate complete test case correctly', async () => {
      const { instance, errors } = await transformAndValidate({
        title: 'Complete test case',
        templateType: TestCaseTemplate.STEPS,
        preconditions: 'User is logged in',
        steps: [
          { stepNumber: 1, action: 'Navigate to settings', expectedResult: 'Settings page opens' },
          { stepNumber: 2, action: 'Click profile tab', data: 'Tab index: 2' },
          { stepNumber: 3, action: 'Update display name', expectedResult: 'Name is updated' },
        ],
        expectedResult: 'Profile is updated successfully',
        priority: Priority.MEDIUM,
        estimate: 10,
      });
      expect(errors).toHaveLength(0);
      expect(instance.steps).toHaveLength(3);
      expect(instance.steps?.[0].stepNumber).toBe(1);
      expect(instance.steps?.[1].action).toBe('Click profile tab');
      expect(instance.steps?.[2].expectedResult).toBe('Name is updated');
    });
  });
});
