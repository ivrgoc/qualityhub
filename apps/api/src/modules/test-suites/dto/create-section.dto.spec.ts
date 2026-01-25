import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateSectionDto } from './create-section.dto';

describe('CreateSectionDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: CreateSectionDto; errors: string[] }> => {
    const instance = plainToInstance(CreateSectionDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  const validData = {
    name: 'Authentication Tests',
    parentId: validUUID,
    position: 0,
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('Authentication Tests');
      expect(instance.parentId).toBe(validUUID);
      expect(instance.position).toBe(0);
    });

    it('should pass validation with only required fields', async () => {
      const { errors } = await transformAndValidate({
        name: 'Section Name',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without parentId', async () => {
      const { errors } = await transformAndValidate({
        name: 'Root Section',
        position: 0,
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without position', async () => {
      const { errors } = await transformAndValidate({
        name: 'Section Name',
        parentId: validUUID,
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

    it('should accept typical section name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'Login - Valid Credentials',
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
      const { errors } = await transformAndValidate({
        parentId: validUUID,
        position: 0,
      });
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

  describe('parentId validation', () => {
    it('should accept valid UUID', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept different valid UUID formats', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        parentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        parentId: 'not-a-valid-uuid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject UUID without hyphens', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        parentId: '123e4567e89b12d3a456426614174000',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept undefined parentId', async () => {
      const dataWithoutParentId = { ...validData };
      delete (dataWithoutParentId as Record<string, unknown>).parentId;
      const { errors } = await transformAndValidate(dataWithoutParentId);
      expect(errors).toHaveLength(0);
    });
  });

  describe('position validation', () => {
    it('should accept position 0', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        position: 0,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept positive position', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        position: 100,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject negative position', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        position: -1,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-integer position', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        position: 1.5,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept undefined position', async () => {
      const dataWithoutPosition = { ...validData };
      delete (dataWithoutPosition as Record<string, unknown>).position;
      const { errors } = await transformAndValidate(dataWithoutPosition);
      expect(errors).toHaveLength(0);
    });

    it('should reject non-number position', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        position: 'first',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        name: '',
        parentId: 'invalid-uuid',
        position: -1,
      });
      expect(errors.length).toBeGreaterThanOrEqual(3);
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
