import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TestStepDto } from './test-step.dto';

describe('TestStepDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: TestStepDto; errors: string[] }> => {
    const instance = plainToInstance(TestStepDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validStep = {
    stepNumber: 1,
    action: 'Click the login button',
    expectedResult: 'Login form is displayed',
    data: 'Use test credentials',
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validStep);
      expect(errors).toHaveLength(0);
      expect(instance.stepNumber).toBe(1);
      expect(instance.action).toBe('Click the login button');
      expect(instance.expectedResult).toBe('Login form is displayed');
      expect(instance.data).toBe('Use test credentials');
    });

    it('should pass validation with only required fields', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Click the button',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with stepNumber and action only', async () => {
      const { instance, errors } = await transformAndValidate({
        stepNumber: 5,
        action: 'Verify the result',
      });
      expect(errors).toHaveLength(0);
      expect(instance.expectedResult).toBeUndefined();
      expect(instance.data).toBeUndefined();
    });
  });

  describe('stepNumber validation', () => {
    it('should accept stepNumber of 1', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept high stepNumber', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 100,
        action: 'Test action',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject stepNumber less than 1', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 0,
        action: 'Test action',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative stepNumber', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: -1,
        action: 'Test action',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-number stepNumber', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 'one',
        action: 'Test action',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing stepNumber', async () => {
      const { errors } = await transformAndValidate({
        action: 'Test action',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('action validation', () => {
    it('should accept valid action', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Click the submit button',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept action with exactly 2000 characters', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'A'.repeat(2000),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject action longer than 2000 characters', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'A'.repeat(2001),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty action', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing action', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string action', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle whitespace-only action (trimming handled at application level)', async () => {
      // Note: IsNotEmpty checks for empty string, not whitespace-only.
      // Whitespace trimming should be handled at the application/service level.
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: '   ',
      });
      // This passes validation since IsNotEmpty doesn't trim whitespace
      expect(errors).toHaveLength(0);
    });
  });

  describe('expectedResult validation', () => {
    it('should accept valid expectedResult', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        expectedResult: 'Form is submitted',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept expectedResult with exactly 2000 characters', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        expectedResult: 'R'.repeat(2000),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject expectedResult longer than 2000 characters', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        expectedResult: 'R'.repeat(2001),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept empty expectedResult', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        expectedResult: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string expectedResult', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        expectedResult: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('data validation', () => {
    it('should accept valid data', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        data: 'Test data: username=test, password=secret',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept data with exactly 2000 characters', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        data: 'D'.repeat(2000),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject data longer than 2000 characters', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        data: 'D'.repeat(2001),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept empty data', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        data: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string data', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Test action',
        data: { key: 'value' },
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 0,
        action: '',
        expectedResult: 12345,
        data: { invalid: true },
      });
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });

    it('should reject invalid values even when other fields are valid', async () => {
      const { errors } = await transformAndValidate({
        stepNumber: 1,
        action: 'Valid action',
        expectedResult: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
