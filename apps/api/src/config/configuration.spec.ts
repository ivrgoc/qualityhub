import configuration, {
  databaseConfig,
  jwtConfig,
  redisConfig,
  appConfig,
} from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('databaseConfig', () => {
    it('should return postgres as type', () => {
      const config = databaseConfig();
      expect(config.type).toBe('postgres');
    });

    it('should use DATABASE_URL from environment', () => {
      process.env['DATABASE_URL'] = 'postgresql://user:pass@host:5432/db';
      const config = databaseConfig();
      expect(config.url).toBe('postgresql://user:pass@host:5432/db');
    });

    it('should use default host when DATABASE_HOST not set', () => {
      delete process.env['DATABASE_HOST'];
      const config = databaseConfig();
      expect(config.host).toBe('localhost');
    });

    it('should use DATABASE_HOST from environment', () => {
      process.env['DATABASE_HOST'] = 'custom-host';
      const config = databaseConfig();
      expect(config.host).toBe('custom-host');
    });

    it('should use default port when DATABASE_PORT not set', () => {
      delete process.env['DATABASE_PORT'];
      const config = databaseConfig();
      expect(config.port).toBe(5432);
    });

    it('should parse DATABASE_PORT as integer', () => {
      process.env['DATABASE_PORT'] = '5433';
      const config = databaseConfig();
      expect(config.port).toBe(5433);
    });

    it('should use default username when POSTGRES_USER not set', () => {
      delete process.env['POSTGRES_USER'];
      const config = databaseConfig();
      expect(config.username).toBe('qualityhub');
    });

    it('should use POSTGRES_USER from environment', () => {
      process.env['POSTGRES_USER'] = 'custom-user';
      const config = databaseConfig();
      expect(config.username).toBe('custom-user');
    });

    it('should use default password when POSTGRES_PASSWORD not set', () => {
      delete process.env['POSTGRES_PASSWORD'];
      const config = databaseConfig();
      expect(config.password).toBe('qualityhub_secret');
    });

    it('should use POSTGRES_PASSWORD from environment', () => {
      process.env['POSTGRES_PASSWORD'] = 'custom-pass';
      const config = databaseConfig();
      expect(config.password).toBe('custom-pass');
    });

    it('should use default database when POSTGRES_DB not set', () => {
      delete process.env['POSTGRES_DB'];
      const config = databaseConfig();
      expect(config.database).toBe('qualityhub');
    });

    it('should use POSTGRES_DB from environment', () => {
      process.env['POSTGRES_DB'] = 'custom-db';
      const config = databaseConfig();
      expect(config.database).toBe('custom-db');
    });

    it('should have autoLoadEntities set to true', () => {
      const config = databaseConfig();
      expect(config.autoLoadEntities).toBe(true);
    });

    it('should disable synchronize in production', () => {
      process.env['NODE_ENV'] = 'production';
      const config = databaseConfig();
      expect(config.synchronize).toBe(false);
    });

    it('should enable synchronize in development', () => {
      process.env['NODE_ENV'] = 'development';
      const config = databaseConfig();
      expect(config.synchronize).toBe(true);
    });

    it('should enable logging in development', () => {
      process.env['NODE_ENV'] = 'development';
      const config = databaseConfig();
      expect(config.logging).toBe(true);
    });

    it('should disable logging in production', () => {
      process.env['NODE_ENV'] = 'production';
      const config = databaseConfig();
      expect(config.logging).toBe(false);
    });
  });

  describe('jwtConfig', () => {
    it('should use default secret when JWT_SECRET not set', () => {
      delete process.env['JWT_SECRET'];
      const config = jwtConfig();
      expect(config.secret).toBe('default-secret-change-in-production');
    });

    it('should use JWT_SECRET from environment', () => {
      process.env['JWT_SECRET'] = 'my-secret-key';
      const config = jwtConfig();
      expect(config.secret).toBe('my-secret-key');
    });

    it('should use default accessTokenExpiry when not set', () => {
      delete process.env['JWT_ACCESS_TOKEN_EXPIRY'];
      const config = jwtConfig();
      expect(config.accessTokenExpiry).toBe(900);
    });

    it('should parse JWT_ACCESS_TOKEN_EXPIRY as integer', () => {
      process.env['JWT_ACCESS_TOKEN_EXPIRY'] = '1800';
      const config = jwtConfig();
      expect(config.accessTokenExpiry).toBe(1800);
    });

    it('should use default refreshTokenExpiry when not set', () => {
      delete process.env['JWT_REFRESH_TOKEN_EXPIRY'];
      const config = jwtConfig();
      expect(config.refreshTokenExpiry).toBe(604800);
    });

    it('should parse JWT_REFRESH_TOKEN_EXPIRY as integer', () => {
      process.env['JWT_REFRESH_TOKEN_EXPIRY'] = '1209600';
      const config = jwtConfig();
      expect(config.refreshTokenExpiry).toBe(1209600);
    });
  });

  describe('redisConfig', () => {
    it('should use default url when REDIS_URL not set', () => {
      delete process.env['REDIS_URL'];
      const config = redisConfig();
      expect(config.url).toBe('redis://localhost:6379');
    });

    it('should use REDIS_URL from environment', () => {
      process.env['REDIS_URL'] = 'redis://custom-host:6380';
      const config = redisConfig();
      expect(config.url).toBe('redis://custom-host:6380');
    });

    it('should use default host when REDIS_HOST not set', () => {
      delete process.env['REDIS_HOST'];
      const config = redisConfig();
      expect(config.host).toBe('localhost');
    });

    it('should use REDIS_HOST from environment', () => {
      process.env['REDIS_HOST'] = 'redis-server';
      const config = redisConfig();
      expect(config.host).toBe('redis-server');
    });

    it('should use default port when REDIS_PORT not set', () => {
      delete process.env['REDIS_PORT'];
      const config = redisConfig();
      expect(config.port).toBe(6379);
    });

    it('should parse REDIS_PORT as integer', () => {
      process.env['REDIS_PORT'] = '6380';
      const config = redisConfig();
      expect(config.port).toBe(6380);
    });
  });

  describe('appConfig', () => {
    it('should use default nodeEnv when NODE_ENV not set', () => {
      delete process.env['NODE_ENV'];
      const config = appConfig();
      expect(config.nodeEnv).toBe('development');
    });

    it('should use NODE_ENV from environment', () => {
      process.env['NODE_ENV'] = 'production';
      const config = appConfig();
      expect(config.nodeEnv).toBe('production');
    });

    it('should use default port when API_PORT not set', () => {
      delete process.env['API_PORT'];
      const config = appConfig();
      expect(config.port).toBe(3000);
    });

    it('should parse API_PORT as integer', () => {
      process.env['API_PORT'] = '4000';
      const config = appConfig();
      expect(config.port).toBe(4000);
    });

    it('should set isProduction to true when NODE_ENV is production', () => {
      process.env['NODE_ENV'] = 'production';
      const config = appConfig();
      expect(config.isProduction).toBe(true);
    });

    it('should set isProduction to false when NODE_ENV is not production', () => {
      process.env['NODE_ENV'] = 'development';
      const config = appConfig();
      expect(config.isProduction).toBe(false);
    });

    it('should set isDevelopment to true when NODE_ENV is development', () => {
      process.env['NODE_ENV'] = 'development';
      const config = appConfig();
      expect(config.isDevelopment).toBe(true);
    });

    it('should set isDevelopment to false when NODE_ENV is not development', () => {
      process.env['NODE_ENV'] = 'production';
      const config = appConfig();
      expect(config.isDevelopment).toBe(false);
    });
  });

  describe('default configuration export', () => {
    it('should return complete configuration object', () => {
      const config = configuration();

      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('jwt');
      expect(config).toHaveProperty('redis');
      expect(config).toHaveProperty('app');
    });

    it('should return database config with correct structure', () => {
      const config = configuration();

      expect(config.database).toHaveProperty('type');
      expect(config.database).toHaveProperty('host');
      expect(config.database).toHaveProperty('port');
      expect(config.database).toHaveProperty('username');
      expect(config.database).toHaveProperty('password');
      expect(config.database).toHaveProperty('database');
      expect(config.database).toHaveProperty('autoLoadEntities');
      expect(config.database).toHaveProperty('synchronize');
      expect(config.database).toHaveProperty('logging');
    });

    it('should return jwt config with correct structure', () => {
      const config = configuration();

      expect(config.jwt).toHaveProperty('secret');
      expect(config.jwt).toHaveProperty('accessTokenExpiry');
      expect(config.jwt).toHaveProperty('refreshTokenExpiry');
    });

    it('should return redis config with correct structure', () => {
      const config = configuration();

      expect(config.redis).toHaveProperty('url');
      expect(config.redis).toHaveProperty('host');
      expect(config.redis).toHaveProperty('port');
    });

    it('should return app config with correct structure', () => {
      const config = configuration();

      expect(config.app).toHaveProperty('nodeEnv');
      expect(config.app).toHaveProperty('port');
      expect(config.app).toHaveProperty('isProduction');
      expect(config.app).toHaveProperty('isDevelopment');
    });
  });
});
