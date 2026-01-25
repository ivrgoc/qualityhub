import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: RegisterDto; errors: string[] }> => {
    const instance = plainToInstance(RegisterDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validData = {
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe',
    organizationName: 'Acme Corporation',
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.email).toBe('user@example.com');
      expect(instance.password).toBe('securePassword123');
      expect(instance.name).toBe('John Doe');
      expect(instance.organizationName).toBe('Acme Corporation');
    });
  });

  describe('email validation', () => {
    it('should accept valid email', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        email: 'invalid-email',
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.toLowerCase().includes('email'))).toBe(true);
    });

    it('should reject email without domain', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        email: 'user@',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing email', async () => {
      const dataWithoutEmail = { ...validData };
      delete (dataWithoutEmail as Record<string, unknown>).email;
      const { errors } = await transformAndValidate(dataWithoutEmail);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('password validation', () => {
    it('should accept password with exactly 12 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: '123456789012',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept password longer than 12 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: 'veryLongSecurePassword123!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject password shorter than 12 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: '12345678901',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject password with 8 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: '12345678',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing password', async () => {
      const dataWithoutPassword = { ...validData };
      delete (dataWithoutPassword as Record<string, unknown>).password;
      const { errors } = await transformAndValidate(dataWithoutPassword);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string password', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: 123456789012,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('name validation', () => {
    it('should accept name with 2 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'Jo',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept name with 100 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'A'.repeat(100),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject name shorter than 2 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 'J',
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

    it('should reject non-string name', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        name: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('organizationName validation', () => {
    it('should accept organizationName with 2 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationName: 'AB',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept organizationName with 100 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationName: 'O'.repeat(100),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject organizationName shorter than 2 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationName: 'A',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject organizationName longer than 100 characters', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationName: 'O'.repeat(101),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing organizationName', async () => {
      const dataWithoutOrg = { ...validData };
      delete (dataWithoutOrg as Record<string, unknown>).organizationName;
      const { errors } = await transformAndValidate(dataWithoutOrg);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string organizationName', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        organizationName: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        email: 'invalid',
        password: 'short',
        name: 'A',
        organizationName: 'B',
      });
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty object', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});
