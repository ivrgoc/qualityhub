import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AddProjectMemberDto } from './add-project-member.dto';
import { ProjectRole } from '../entities/project-member.entity';

describe('AddProjectMemberDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: AddProjectMemberDto; errors: string[] }> => {
    const instance = plainToInstance(AddProjectMemberDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  const validData = {
    userId: validUUID,
    role: ProjectRole.TESTER,
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.userId).toBe(validUUID);
      expect(instance.role).toBe(ProjectRole.TESTER);
    });

    it('should pass validation with only required userId', async () => {
      const { instance, errors } = await transformAndValidate({
        userId: validUUID,
      });
      expect(errors).toHaveLength(0);
      expect(instance.userId).toBe(validUUID);
      expect(instance.role).toBeUndefined();
    });
  });

  describe('userId validation', () => {
    it('should accept valid UUID', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept different valid UUID formats', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept UUID v1', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: 'not-a-valid-uuid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject UUID without hyphens', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: '123e4567e89b12d3a456426614174000',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing userId', async () => {
      const dataWithoutUserId = { ...validData };
      delete (dataWithoutUserId as Record<string, unknown>).userId;
      const { errors } = await transformAndValidate(dataWithoutUserId);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty userId', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string userId', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject null userId', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        userId: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('role validation', () => {
    it('should accept VIEWER role', async () => {
      const { instance, errors } = await transformAndValidate({
        ...validData,
        role: ProjectRole.VIEWER,
      });
      expect(errors).toHaveLength(0);
      expect(instance.role).toBe(ProjectRole.VIEWER);
    });

    it('should accept TESTER role', async () => {
      const { instance, errors } = await transformAndValidate({
        ...validData,
        role: ProjectRole.TESTER,
      });
      expect(errors).toHaveLength(0);
      expect(instance.role).toBe(ProjectRole.TESTER);
    });

    it('should accept LEAD role', async () => {
      const { instance, errors } = await transformAndValidate({
        ...validData,
        role: ProjectRole.LEAD,
      });
      expect(errors).toHaveLength(0);
      expect(instance.role).toBe(ProjectRole.LEAD);
    });

    it('should accept ADMIN role', async () => {
      const { instance, errors } = await transformAndValidate({
        ...validData,
        role: ProjectRole.ADMIN,
      });
      expect(errors).toHaveLength(0);
      expect(instance.role).toBe(ProjectRole.ADMIN);
    });

    it('should accept undefined role (optional)', async () => {
      const dataWithoutRole = { userId: validUUID };
      const { instance, errors } = await transformAndValidate(dataWithoutRole);
      expect(errors).toHaveLength(0);
      expect(instance.role).toBeUndefined();
    });

    it('should reject invalid role value', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        role: 'superadmin',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject numeric role', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        role: 1,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty string role', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        role: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject role with different casing', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        role: 'TESTER',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject role with different casing (Tester)', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        role: 'Tester',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        userId: 'invalid-uuid',
        role: 'invalid-role',
      });
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty object', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle null values for all fields', async () => {
      const { errors } = await transformAndValidate({
        userId: null,
        role: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
