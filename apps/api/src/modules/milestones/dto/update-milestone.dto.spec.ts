import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateMilestoneDto } from './update-milestone.dto';

describe('UpdateMilestoneDto', () => {
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
  ): Promise<{ instance: UpdateMilestoneDto; errors: string[] }> => {
    const instance = plainToInstance(UpdateMilestoneDto, plain);
    const validationErrors = await validate(instance);
    const errors = collectErrors(validationErrors);
    return { instance, errors };
  };

  describe('valid input', () => {
    it('should pass validation with empty object (all fields optional)', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only name', async () => {
      const { errors, instance } = await transformAndValidate({
        name: 'Updated Name',
      });
      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('Updated Name');
    });

    it('should pass validation with only description', async () => {
      const { errors, instance } = await transformAndValidate({
        description: 'Updated description',
      });
      expect(errors).toHaveLength(0);
      expect(instance.description).toBe('Updated description');
    });

    it('should pass validation with only dueDate', async () => {
      const { errors, instance } = await transformAndValidate({
        dueDate: '2024-12-31',
      });
      expect(errors).toHaveLength(0);
      expect(instance.dueDate).toBe('2024-12-31');
    });

    it('should pass validation with only isCompleted', async () => {
      const { errors, instance } = await transformAndValidate({
        isCompleted: true,
      });
      expect(errors).toHaveLength(0);
      expect(instance.isCompleted).toBe(true);
    });

    it('should pass validation with all fields', async () => {
      const { errors, instance } = await transformAndValidate({
        name: 'Updated Name',
        description: 'Updated description',
        dueDate: '2024-12-31T23:59:59Z',
        isCompleted: true,
      });
      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('Updated Name');
      expect(instance.description).toBe('Updated description');
      expect(instance.dueDate).toBe('2024-12-31T23:59:59Z');
      expect(instance.isCompleted).toBe(true);
    });
  });

  describe('name validation', () => {
    it('should accept name with exactly 3 characters', async () => {
      const { errors } = await transformAndValidate({
        name: 'ABC',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept name with exactly 100 characters', async () => {
      const { errors } = await transformAndValidate({
        name: 'A'.repeat(100),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject name shorter than 3 characters', async () => {
      const { errors } = await transformAndValidate({
        name: 'AB',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject name longer than 100 characters', async () => {
      const { errors } = await transformAndValidate({
        name: 'A'.repeat(101),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string name', async () => {
      const { errors } = await transformAndValidate({
        name: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('description validation', () => {
    it('should accept valid description', async () => {
      const { errors } = await transformAndValidate({
        description: 'A detailed description of the milestone',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept description with exactly 500 characters', async () => {
      const { errors } = await transformAndValidate({
        description: 'A'.repeat(500),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject description longer than 500 characters', async () => {
      const { errors } = await transformAndValidate({
        description: 'A'.repeat(501),
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('dueDate validation', () => {
    it('should accept valid ISO date string', async () => {
      const { errors } = await transformAndValidate({
        dueDate: '2024-03-31T23:59:59Z',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept simple date string', async () => {
      const { errors } = await transformAndValidate({
        dueDate: '2024-03-31',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid date string', async () => {
      const { errors } = await transformAndValidate({
        dueDate: 'not-a-date',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('isCompleted validation', () => {
    it('should accept true isCompleted status', async () => {
      const { errors, instance } = await transformAndValidate({
        isCompleted: true,
      });
      expect(errors).toHaveLength(0);
      expect(instance.isCompleted).toBe(true);
    });

    it('should accept false isCompleted status', async () => {
      const { errors, instance } = await transformAndValidate({
        isCompleted: false,
      });
      expect(errors).toHaveLength(0);
      expect(instance.isCompleted).toBe(false);
    });

    it('should reject non-boolean isCompleted', async () => {
      const { errors } = await transformAndValidate({
        isCompleted: 'yes',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        name: 'AB',
        description: 'A'.repeat(501),
        dueDate: 'invalid',
        isCompleted: 'not-boolean',
      });
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });

    it('should allow partial updates with valid fields only', async () => {
      const { instance, errors } = await transformAndValidate({
        isCompleted: true,
      });
      expect(errors).toHaveLength(0);
      expect(instance.isCompleted).toBe(true);
      expect(instance.name).toBeUndefined();
      expect(instance.description).toBeUndefined();
      expect(instance.dueDate).toBeUndefined();
    });
  });
});
