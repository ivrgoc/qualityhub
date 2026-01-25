import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTestSuiteDto } from './create-test-suite.dto';

describe('CreateTestSuiteDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: CreateTestSuiteDto; errors: string[] }> => {
    const instance = plainToInstance(CreateTestSuiteDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validData = {
    name: 'Login Test Suite',
    description: 'Test suite for login functionality',
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('Login Test Suite');
      expect(instance.description).toBe('Test suite for login functionality');
    });

    it('should pass validation with only required fields', async () => {
      const { errors } = await transformAndValidate({
        name: 'Test Suite',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without description', async () => {
      const { errors } = await transformAndValidate({
        name: 'Test Suite',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('name validation', () => {
    it('should accept name with exactly 1 character', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept name with exactly 255 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A'.repeat(255),
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept typical suite name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'E-commerce Login Tests v2.0',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject empty name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject name longer than 255 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A'.repeat(256),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing name', async () => {
      const dataWithoutName = { ...validData };
      delete (dataWithoutName as Record<string, unknown>).name;
      const { errors } = await transformAndValidate(dataWithoutName);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('description validation', () => {
    it('should accept valid description', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept empty string description', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        description: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept long description', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        description: 'D'.repeat(5000),
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept undefined description', async () => {
      const dataWithoutDescription = { ...validData };
      delete (dataWithoutDescription as Record<string, unknown>).description;
      const { errors } = await transformAndValidate(dataWithoutDescription);
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string description', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        description: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        name: '',
        description: 12345,
      });
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty object', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle null values', async () => {
      const { errors } = await transformAndValidate({
        name: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
