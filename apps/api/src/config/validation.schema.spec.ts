import { validationSchema } from './validation.schema';

describe('validationSchema', () => {
  describe('NODE_ENV', () => {
    it('should accept valid NODE_ENV values', () => {
      const validValues = ['development', 'staging', 'production', 'test'];
      validValues.forEach((value) => {
        const { error } = validationSchema.validate({ NODE_ENV: value });
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid NODE_ENV value', () => {
      const { error } = validationSchema.validate({ NODE_ENV: 'invalid' });
      expect(error).toBeDefined();
      expect(error?.message).toContain('NODE_ENV');
    });

    it('should default NODE_ENV to development', () => {
      const { value } = validationSchema.validate({});
      expect(value.NODE_ENV).toBe('development');
    });
  });

  describe('API_PORT', () => {
    it('should accept valid port number', () => {
      const { error, value } = validationSchema.validate({ API_PORT: 4000 });
      expect(error).toBeUndefined();
      expect(value.API_PORT).toBe(4000);
    });

    it('should accept port as string and convert to number', () => {
      const { error, value } = validationSchema.validate({ API_PORT: '4000' });
      expect(error).toBeUndefined();
      expect(value.API_PORT).toBe(4000);
    });

    it('should reject invalid port number', () => {
      const { error } = validationSchema.validate({ API_PORT: 70000 });
      expect(error).toBeDefined();
    });

    it('should default API_PORT to 3000', () => {
      const { value } = validationSchema.validate({});
      expect(value.API_PORT).toBe(3000);
    });
  });

  describe('DATABASE_URL', () => {
    it('should accept valid postgresql URL', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect(error).toBeUndefined();
    });

    it('should accept valid postgres URL', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid database URL scheme', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
      });
      expect(error).toBeDefined();
      expect(error?.message).toContain('DATABASE_URL');
    });
  });

  describe('DATABASE_HOST', () => {
    it('should accept valid hostname', () => {
      const { error, value } = validationSchema.validate({
        DATABASE_HOST: 'db.example.com',
      });
      expect(error).toBeUndefined();
      expect(value.DATABASE_HOST).toBe('db.example.com');
    });

    it('should default DATABASE_HOST to localhost', () => {
      const { value } = validationSchema.validate({});
      expect(value.DATABASE_HOST).toBe('localhost');
    });
  });

  describe('DATABASE_PORT', () => {
    it('should accept valid port', () => {
      const { error, value } = validationSchema.validate({
        DATABASE_PORT: 5433,
      });
      expect(error).toBeUndefined();
      expect(value.DATABASE_PORT).toBe(5433);
    });

    it('should default DATABASE_PORT to 5432', () => {
      const { value } = validationSchema.validate({});
      expect(value.DATABASE_PORT).toBe(5432);
    });
  });

  describe('POSTGRES_USER', () => {
    it('should accept valid username', () => {
      const { error, value } = validationSchema.validate({
        POSTGRES_USER: 'myuser',
      });
      expect(error).toBeUndefined();
      expect(value.POSTGRES_USER).toBe('myuser');
    });

    it('should default POSTGRES_USER to qualityhub', () => {
      const { value } = validationSchema.validate({});
      expect(value.POSTGRES_USER).toBe('qualityhub');
    });
  });

  describe('POSTGRES_PASSWORD', () => {
    it('should accept valid password', () => {
      const { error, value } = validationSchema.validate({
        POSTGRES_PASSWORD: 'secret123',
      });
      expect(error).toBeUndefined();
      expect(value.POSTGRES_PASSWORD).toBe('secret123');
    });

    it('should default POSTGRES_PASSWORD to qualityhub_secret', () => {
      const { value } = validationSchema.validate({});
      expect(value.POSTGRES_PASSWORD).toBe('qualityhub_secret');
    });
  });

  describe('POSTGRES_DB', () => {
    it('should accept valid database name', () => {
      const { error, value } = validationSchema.validate({
        POSTGRES_DB: 'mydb',
      });
      expect(error).toBeUndefined();
      expect(value.POSTGRES_DB).toBe('mydb');
    });

    it('should default POSTGRES_DB to qualityhub', () => {
      const { value } = validationSchema.validate({});
      expect(value.POSTGRES_DB).toBe('qualityhub');
    });
  });

  describe('JWT_SECRET', () => {
    it('should accept valid secret with minimum length', () => {
      const { error, value } = validationSchema.validate({
        JWT_SECRET: 'this-is-a-valid-secret-key',
      });
      expect(error).toBeUndefined();
      expect(value.JWT_SECRET).toBe('this-is-a-valid-secret-key');
    });

    it('should reject secret shorter than 16 characters', () => {
      const { error } = validationSchema.validate({
        JWT_SECRET: 'short',
      });
      expect(error).toBeDefined();
      expect(error?.message).toContain('JWT_SECRET');
    });

    it('should default JWT_SECRET', () => {
      const { value } = validationSchema.validate({});
      expect(value.JWT_SECRET).toBe('default-secret-change-in-production');
    });
  });

  describe('JWT_ACCESS_TOKEN_EXPIRY', () => {
    it('should accept valid positive number', () => {
      const { error, value } = validationSchema.validate({
        JWT_ACCESS_TOKEN_EXPIRY: 1800,
      });
      expect(error).toBeUndefined();
      expect(value.JWT_ACCESS_TOKEN_EXPIRY).toBe(1800);
    });

    it('should reject non-positive number', () => {
      const { error } = validationSchema.validate({
        JWT_ACCESS_TOKEN_EXPIRY: 0,
      });
      expect(error).toBeDefined();
    });

    it('should default JWT_ACCESS_TOKEN_EXPIRY to 900', () => {
      const { value } = validationSchema.validate({});
      expect(value.JWT_ACCESS_TOKEN_EXPIRY).toBe(900);
    });
  });

  describe('JWT_REFRESH_TOKEN_EXPIRY', () => {
    it('should accept valid positive number', () => {
      const { error, value } = validationSchema.validate({
        JWT_REFRESH_TOKEN_EXPIRY: 1209600,
      });
      expect(error).toBeUndefined();
      expect(value.JWT_REFRESH_TOKEN_EXPIRY).toBe(1209600);
    });

    it('should reject non-positive number', () => {
      const { error } = validationSchema.validate({
        JWT_REFRESH_TOKEN_EXPIRY: -1,
      });
      expect(error).toBeDefined();
    });

    it('should default JWT_REFRESH_TOKEN_EXPIRY to 604800', () => {
      const { value } = validationSchema.validate({});
      expect(value.JWT_REFRESH_TOKEN_EXPIRY).toBe(604800);
    });
  });

  describe('REDIS_URL', () => {
    it('should accept valid redis URL', () => {
      const { error } = validationSchema.validate({
        REDIS_URL: 'redis://localhost:6379',
      });
      expect(error).toBeUndefined();
    });

    it('should accept valid rediss URL (TLS)', () => {
      const { error } = validationSchema.validate({
        REDIS_URL: 'rediss://redis.example.com:6380',
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid redis URL scheme', () => {
      const { error } = validationSchema.validate({
        REDIS_URL: 'http://localhost:6379',
      });
      expect(error).toBeDefined();
      expect(error?.message).toContain('REDIS_URL');
    });

    it('should default REDIS_URL to redis://localhost:6379', () => {
      const { value } = validationSchema.validate({});
      expect(value.REDIS_URL).toBe('redis://localhost:6379');
    });
  });

  describe('REDIS_HOST', () => {
    it('should accept valid hostname', () => {
      const { error, value } = validationSchema.validate({
        REDIS_HOST: 'redis.example.com',
      });
      expect(error).toBeUndefined();
      expect(value.REDIS_HOST).toBe('redis.example.com');
    });

    it('should default REDIS_HOST to localhost', () => {
      const { value } = validationSchema.validate({});
      expect(value.REDIS_HOST).toBe('localhost');
    });
  });

  describe('REDIS_PORT', () => {
    it('should accept valid port', () => {
      const { error, value } = validationSchema.validate({
        REDIS_PORT: 6380,
      });
      expect(error).toBeUndefined();
      expect(value.REDIS_PORT).toBe(6380);
    });

    it('should default REDIS_PORT to 6379', () => {
      const { value } = validationSchema.validate({});
      expect(value.REDIS_PORT).toBe(6379);
    });
  });

  describe('full configuration', () => {
    it('should validate complete valid configuration', () => {
      const config = {
        NODE_ENV: 'production',
        API_PORT: 8080,
        DATABASE_URL: 'postgresql://admin:secret@db.example.com:5432/qualityhub',
        DATABASE_HOST: 'db.example.com',
        DATABASE_PORT: 5432,
        POSTGRES_USER: 'admin',
        POSTGRES_PASSWORD: 'secret',
        POSTGRES_DB: 'qualityhub',
        JWT_SECRET: 'super-secret-production-key-that-is-long-enough',
        JWT_ACCESS_TOKEN_EXPIRY: 900,
        JWT_REFRESH_TOKEN_EXPIRY: 604800,
        REDIS_URL: 'redis://redis.example.com:6379',
        REDIS_HOST: 'redis.example.com',
        REDIS_PORT: 6379,
      };

      const { error } = validationSchema.validate(config);
      expect(error).toBeUndefined();
    });

    it('should apply all defaults when empty object provided', () => {
      const { error, value } = validationSchema.validate({});

      expect(error).toBeUndefined();
      expect(value).toEqual({
        NODE_ENV: 'development',
        API_PORT: 3000,
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: 5432,
        POSTGRES_USER: 'qualityhub',
        POSTGRES_PASSWORD: 'qualityhub_secret',
        POSTGRES_DB: 'qualityhub',
        JWT_SECRET: 'default-secret-change-in-production',
        JWT_ACCESS_TOKEN_EXPIRY: 900,
        JWT_REFRESH_TOKEN_EXPIRY: 604800,
        REDIS_URL: 'redis://localhost:6379',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
      });
    });
  });
});
