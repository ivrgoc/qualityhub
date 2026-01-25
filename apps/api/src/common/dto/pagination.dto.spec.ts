import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: PaginationDto; errors: string[] }> => {
    const instance = plainToInstance(PaginationDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  describe('default values', () => {
    it('should have default page of 1', async () => {
      const { instance, errors } = await transformAndValidate({});
      expect(errors).toHaveLength(0);
      expect(instance.page).toBe(1);
    });

    it('should have default limit of 25', async () => {
      const { instance, errors } = await transformAndValidate({});
      expect(errors).toHaveLength(0);
      expect(instance.limit).toBe(25);
    });

    it('should have default sortOrder of desc', async () => {
      const { instance, errors } = await transformAndValidate({});
      expect(errors).toHaveLength(0);
      expect(instance.sortOrder).toBe('desc');
    });

    it('should have undefined sortBy by default', async () => {
      const { instance, errors } = await transformAndValidate({});
      expect(errors).toHaveLength(0);
      expect(instance.sortBy).toBeUndefined();
    });
  });

  describe('page validation', () => {
    it('should accept valid page number', async () => {
      const { instance, errors } = await transformAndValidate({ page: 5 });
      expect(errors).toHaveLength(0);
      expect(instance.page).toBe(5);
    });

    it('should transform string page to number', async () => {
      const { instance, errors } = await transformAndValidate({ page: '3' });
      expect(errors).toHaveLength(0);
      expect(instance.page).toBe(3);
    });

    it('should reject page less than 1', async () => {
      const { errors } = await transformAndValidate({ page: 0 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative page', async () => {
      const { errors } = await transformAndValidate({ page: -1 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-integer page', async () => {
      const { errors } = await transformAndValidate({ page: 1.5 });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('limit validation', () => {
    it('should accept valid limit', async () => {
      const { instance, errors } = await transformAndValidate({ limit: 50 });
      expect(errors).toHaveLength(0);
      expect(instance.limit).toBe(50);
    });

    it('should transform string limit to number', async () => {
      const { instance, errors } = await transformAndValidate({ limit: '10' });
      expect(errors).toHaveLength(0);
      expect(instance.limit).toBe(10);
    });

    it('should reject limit less than 1', async () => {
      const { errors } = await transformAndValidate({ limit: 0 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject limit greater than 100', async () => {
      const { errors } = await transformAndValidate({ limit: 101 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept limit of 100', async () => {
      const { instance, errors } = await transformAndValidate({ limit: 100 });
      expect(errors).toHaveLength(0);
      expect(instance.limit).toBe(100);
    });

    it('should accept limit of 1', async () => {
      const { instance, errors } = await transformAndValidate({ limit: 1 });
      expect(errors).toHaveLength(0);
      expect(instance.limit).toBe(1);
    });

    it('should reject non-integer limit', async () => {
      const { errors } = await transformAndValidate({ limit: 25.5 });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('sortBy validation', () => {
    it('should accept valid sortBy string', async () => {
      const { instance, errors } = await transformAndValidate({
        sortBy: 'createdAt',
      });
      expect(errors).toHaveLength(0);
      expect(instance.sortBy).toBe('createdAt');
    });

    it('should accept sortBy with underscore', async () => {
      const { instance, errors } = await transformAndValidate({
        sortBy: 'created_at',
      });
      expect(errors).toHaveLength(0);
      expect(instance.sortBy).toBe('created_at');
    });

    it('should reject non-string sortBy', async () => {
      const { errors } = await transformAndValidate({ sortBy: 123 });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('sortOrder validation', () => {
    it('should accept asc sortOrder', async () => {
      const { instance, errors } = await transformAndValidate({
        sortOrder: 'asc',
      });
      expect(errors).toHaveLength(0);
      expect(instance.sortOrder).toBe('asc');
    });

    it('should accept desc sortOrder', async () => {
      const { instance, errors } = await transformAndValidate({
        sortOrder: 'desc',
      });
      expect(errors).toHaveLength(0);
      expect(instance.sortOrder).toBe('desc');
    });

    it('should reject invalid sortOrder', async () => {
      const { errors } = await transformAndValidate({ sortOrder: 'invalid' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject uppercase sortOrder', async () => {
      const { errors } = await transformAndValidate({ sortOrder: 'ASC' });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should accept all valid fields together', async () => {
      const { instance, errors } = await transformAndValidate({
        page: 2,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      expect(errors).toHaveLength(0);
      expect(instance.page).toBe(2);
      expect(instance.limit).toBe(50);
      expect(instance.sortBy).toBe('name');
      expect(instance.sortOrder).toBe('asc');
    });

    it('should handle string query parameters', async () => {
      const { instance, errors } = await transformAndValidate({
        page: '2',
        limit: '50',
        sortBy: 'name',
        sortOrder: 'asc',
      });
      expect(errors).toHaveLength(0);
      expect(instance.page).toBe(2);
      expect(instance.limit).toBe(50);
    });

    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        page: 0,
        limit: 200,
        sortOrder: 'invalid',
      });
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
