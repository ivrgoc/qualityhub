import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProjectDto } from './create-project.dto';

describe('CreateProjectDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: CreateProjectDto; errors: string[] }> => {
    const instance = plainToInstance(CreateProjectDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  const validData = {
    organizationId: validUUID,
    name: 'My Project',
    description: 'Project description',
    settings: { theme: 'dark' },
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.organizationId).toBe(validUUID);
      expect(instance.name).toBe('My Project');
      expect(instance.description).toBe('Project description');
      expect(instance.settings).toEqual({ theme: 'dark' });
    });

    it('should pass validation with only required fields', async () => {
      const { errors } = await transformAndValidate({
        organizationId: validUUID,
        name: 'My Project',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without description', async () => {
      const { errors } = await transformAndValidate({
        organizationId: validUUID,
        name: 'My Project',
        settings: { key: 'value' },
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without settings', async () => {
      const { errors } = await transformAndValidate({
        organizationId: validUUID,
        name: 'My Project',
        description: 'A description',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('organizationId validation', () => {
    it('should accept valid UUID', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept different valid UUID formats', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationId: 'not-a-valid-uuid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject UUID without hyphens', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationId: '123e4567e89b12d3a456426614174000',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing organizationId', async () => {
      const dataWithoutOrgId = { ...validData };
      delete (dataWithoutOrgId as Record<string, unknown>).organizationId;
      const { errors } = await transformAndValidate(dataWithoutOrgId);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty organizationId', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationId: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string organizationId', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationId: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('name validation', () => {
    it('should accept name with exactly 3 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'ABC',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept name with exactly 100 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A'.repeat(100),
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept typical project name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'E-commerce Platform v2.0',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject name shorter than 3 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'AB',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject name with 1 character', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject name longer than 100 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A'.repeat(101),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing name', async () => {
      const dataWithoutName = { ...validData };
      delete (dataWithoutName as Record<string, unknown>).name;
      const { errors } = await transformAndValidate(dataWithoutName);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: '',
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

    it('should accept description at max length (500 characters)', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        description: 'D'.repeat(500),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject description longer than 500 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        description: 'D'.repeat(501),
      });
      expect(errors.length).toBeGreaterThan(0);
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

  describe('settings validation', () => {
    it('should accept valid object settings', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept empty object settings', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        settings: {},
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept nested object settings', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept undefined settings', async () => {
      const dataWithoutSettings = { ...validData };
      delete (dataWithoutSettings as Record<string, unknown>).settings;
      const { errors } = await transformAndValidate(dataWithoutSettings);
      expect(errors).toHaveLength(0);
    });

    it('should reject non-object settings (string)', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        settings: 'not-an-object',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-object settings (number)', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        settings: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject array settings', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        settings: ['item1', 'item2'],
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        organizationId: 'invalid-uuid',
        name: 'AB',
        description: 'D'.repeat(501),
        settings: 'not-an-object',
      });
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty object', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle null values', async () => {
      const { errors } = await transformAndValidate({
        organizationId: null,
        name: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
