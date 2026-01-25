import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMilestoneDto } from './create-milestone.dto';

describe('CreateMilestoneDto', () => {
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
  ): Promise<{ instance: CreateMilestoneDto; errors: string[] }> => {
    const instance = plainToInstance(CreateMilestoneDto, plain);
    const validationErrors = await validate(instance);
    const errors = collectErrors(validationErrors);
    return { instance, errors };
  };

  const validData = {
    name: 'Q1 Release',
    description: 'End of quarter milestone',
    dueDate: '2024-03-31T23:59:59Z',
    isCompleted: false,
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('Q1 Release');
      expect(instance.description).toBe('End of quarter milestone');
      expect(instance.dueDate).toBe('2024-03-31T23:59:59Z');
      expect(instance.isCompleted).toBe(false);
    });

    it('should pass validation with only required name', async () => {
      const { errors } = await transformAndValidate({
        name: 'Minimal milestone',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with name and dueDate', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone with date',
        dueDate: '2024-12-31',
      });
      expect(errors).toHaveLength(0);
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

    it('should reject empty name', async () => {
      const { errors } = await transformAndValidate({
        name: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing name', async () => {
      const { errors } = await transformAndValidate({});
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
        name: 'Milestone',
        description: 'A detailed description of the milestone',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty description', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        description: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept description with exactly 500 characters', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        description: 'A'.repeat(500),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject description longer than 500 characters', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        description: 'A'.repeat(501),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string description', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        description: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('dueDate validation', () => {
    it('should accept valid ISO date string', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        dueDate: '2024-03-31T23:59:59Z',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept simple date string', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        dueDate: '2024-03-31',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid date string', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        dueDate: 'not-a-date',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string dueDate', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
        dueDate: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('isCompleted validation', () => {
    it('should accept true isCompleted status', async () => {
      const { errors, instance } = await transformAndValidate({
        name: 'Milestone',
        isCompleted: true,
      });
      expect(errors).toHaveLength(0);
      expect(instance.isCompleted).toBe(true);
    });

    it('should accept false isCompleted status', async () => {
      const { errors, instance } = await transformAndValidate({
        name: 'Milestone',
        isCompleted: false,
      });
      expect(errors).toHaveLength(0);
      expect(instance.isCompleted).toBe(false);
    });

    it('should reject non-boolean isCompleted', async () => {
      const { errors } = await transformAndValidate({
        name: 'Milestone',
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

    it('should transform and validate complete milestone correctly', async () => {
      const { instance, errors } = await transformAndValidate({
        name: 'Complete milestone',
        description: 'A complete milestone with all fields',
        dueDate: '2024-12-31T23:59:59Z',
        isCompleted: false,
      });
      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('Complete milestone');
      expect(instance.description).toBe('A complete milestone with all fields');
      expect(instance.dueDate).toBe('2024-12-31T23:59:59Z');
      expect(instance.isCompleted).toBe(false);
    });
  });
});
