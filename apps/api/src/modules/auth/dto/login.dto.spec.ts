import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: LoginDto; errors: string[] }> => {
    const instance = plainToInstance(LoginDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validData = {
    email: 'user@example.com',
    password: 'securePassword123',
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.email).toBe('user@example.com');
      expect(instance.password).toBe('securePassword123');
    });
  });

  describe('email validation', () => {
    it('should accept valid email', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept email with subdomain', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        email: 'user@mail.example.com',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept email with plus sign', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        email: 'user+tag@example.com',
      });
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

    it('should reject email without @ symbol', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        email: 'userexample.com',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing email', async () => {
      const dataWithoutEmail = { ...validData };
      delete (dataWithoutEmail as Record<string, unknown>).email;
      const { errors } = await transformAndValidate(dataWithoutEmail);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty email', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        email: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('password validation', () => {
    it('should accept valid password', async () => {
      const { errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should accept short password (login does not enforce length)', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: 'short',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept single character password', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: 'a',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject missing password', async () => {
      const dataWithoutPassword = { ...validData };
      delete (dataWithoutPassword as Record<string, unknown>).password;
      const { errors } = await transformAndValidate(dataWithoutPassword);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty password', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string password', async () => {
      const { errors } = await transformAndValidate({
        ...validData,
        password: 123456,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        email: 'invalid',
        password: '',
      });
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty object', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle null values', async () => {
      const { errors } = await transformAndValidate({
        email: null,
        password: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
