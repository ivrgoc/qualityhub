import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTestCaseDto } from './update-test-case.dto';
import { TestCaseTemplate, Priority } from '../entities/test-case.entity';

describe('UpdateTestCaseDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: UpdateTestCaseDto; errors: string[] }> => {
    const instance = plainToInstance(UpdateTestCaseDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  const validData = {
    title: 'Updated Test Case',
    templateType: TestCaseTemplate.STEPS,
    preconditions: 'User is logged in',
    steps: [{ step: 1, action: 'Click button' }],
    expectedResult: 'Button clicked successfully',
    priority: Priority.HIGH,
    estimate: 10,
    customFields: { key: 'value' },
    sectionId: validUUID,
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.title).toBe('Updated Test Case');
      expect(instance.templateType).toBe(TestCaseTemplate.STEPS);
      expect(instance.priority).toBe(Priority.HIGH);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only title', async () => {
      const { errors } = await transformAndValidate({
        title: 'Only Title',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only priority', async () => {
      const { errors } = await transformAndValidate({
        priority: Priority.CRITICAL,
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only sectionId', async () => {
      const { errors } = await transformAndValidate({
        sectionId: validUUID,
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
        templateType: TestCaseTemplate.STEPS,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid TEXT template type', async () => {
      const { errors } = await transformAndValidate({
        templateType: TestCaseTemplate.TEXT,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid BDD template type', async () => {
      const { errors } = await transformAndValidate({
        templateType: TestCaseTemplate.BDD,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid EXPLORATORY template type', async () => {
      const { errors } = await transformAndValidate({
        templateType: TestCaseTemplate.EXPLORATORY,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid template type', async () => {
      const { errors } = await transformAndValidate({
        templateType: 'invalid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('priority validation', () => {
    it('should accept valid CRITICAL priority', async () => {
      const { errors } = await transformAndValidate({
        priority: Priority.CRITICAL,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid HIGH priority', async () => {
      const { errors } = await transformAndValidate({
        priority: Priority.HIGH,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid MEDIUM priority', async () => {
      const { errors } = await transformAndValidate({
        priority: Priority.MEDIUM,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept valid LOW priority', async () => {
      const { errors } = await transformAndValidate({
        priority: Priority.LOW,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid priority', async () => {
      const { errors } = await transformAndValidate({
        priority: 'urgent',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('preconditions validation', () => {
    it('should accept valid preconditions', async () => {
      const { errors } = await transformAndValidate({
        preconditions: 'User is logged in',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty preconditions', async () => {
      const { errors } = await transformAndValidate({
        preconditions: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string preconditions', async () => {
      const { errors } = await transformAndValidate({
        preconditions: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('expectedResult validation', () => {
    it('should accept valid expectedResult', async () => {
      const { errors } = await transformAndValidate({
        expectedResult: 'User is redirected to dashboard',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty expectedResult', async () => {
      const { errors } = await transformAndValidate({
        expectedResult: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string expectedResult', async () => {
      const { errors } = await transformAndValidate({
        expectedResult: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('steps validation', () => {
    it('should accept valid steps array', async () => {
      const { errors } = await transformAndValidate({
        steps: [
          { step: 1, action: 'Click login' },
          { step: 2, action: 'Enter credentials' },
        ],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty steps array', async () => {
      const { errors } = await transformAndValidate({
        steps: [],
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-array steps', async () => {
      const { errors } = await transformAndValidate({
        steps: 'not an array',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('estimate validation', () => {
    it('should accept valid estimate', async () => {
      const { errors } = await transformAndValidate({
        estimate: 5,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept zero estimate', async () => {
      const { errors } = await transformAndValidate({
        estimate: 0,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-number estimate', async () => {
      const { errors } = await transformAndValidate({
        estimate: 'five',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('customFields validation', () => {
    it('should accept valid customFields object', async () => {
      const { errors } = await transformAndValidate({
        customFields: { key: 'value', count: 10 },
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty customFields object', async () => {
      const { errors } = await transformAndValidate({
        customFields: {},
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept nested customFields object', async () => {
      const { errors } = await transformAndValidate({
        customFields: {
          level1: {
            level2: 'value',
          },
        },
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject non-object customFields', async () => {
      const { errors } = await transformAndValidate({
        customFields: 'not an object',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject array customFields', async () => {
      const { errors } = await transformAndValidate({
        customFields: ['item1', 'item2'],
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('sectionId validation', () => {
    it('should accept valid UUID sectionId', async () => {
      const { errors } = await transformAndValidate({
        sectionId: validUUID,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept different valid UUID format', async () => {
      const { errors } = await transformAndValidate({
        sectionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const { errors } = await transformAndValidate({
        sectionId: 'not-a-valid-uuid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject UUID without hyphens', async () => {
      const { errors } = await transformAndValidate({
        sectionId: '123e4567e89b12d3a456426614174000',
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
      });
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should reject invalid values even when other fields are valid', async () => {
      const { errors } = await transformAndValidate({
        title: 'Valid Title',
        templateType: 'invalid-template',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
