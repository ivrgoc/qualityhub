import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import databaseConfig, { typeOrmAsyncConfig } from './database.config';

describe('database.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('databaseConfig (registerAs)', () => {
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

  describe('typeOrmAsyncConfig', () => {
    it('should have ConfigModule in imports', () => {
      expect(typeOrmAsyncConfig.imports).toContain(ConfigModule);
    });

    it('should have ConfigService in inject array', () => {
      expect(typeOrmAsyncConfig.inject).toContain(ConfigService);
    });

    it('should have a useFactory function', () => {
      expect(typeof typeOrmAsyncConfig.useFactory).toBe('function');
    });

    describe('useFactory', () => {
      let mockConfigService: jest.Mocked<ConfigService>;

      beforeEach(() => {
        mockConfigService = {
          get: jest.fn(),
        } as unknown as jest.Mocked<ConfigService>;
      });

      it('should return postgres as type', () => {
        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);
        expect(result.type).toBe('postgres');
      });

      it('should get database.url from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.url') return 'postgresql://test:test@localhost:5432/test';
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.url');
        expect(result.url).toBe('postgresql://test:test@localhost:5432/test');
      });

      it('should get database.host from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.host') return 'test-host';
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.host');
        expect(result.host).toBe('test-host');
      });

      it('should get database.port from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.port') return 5433;
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.port');
        expect(result.port).toBe(5433);
      });

      it('should get database.username from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.username') return 'test-user';
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.username');
        expect(result.username).toBe('test-user');
      });

      it('should get database.password from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.password') return 'test-password';
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.password');
        expect(result.password).toBe('test-password');
      });

      it('should get database.database from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.database') return 'test-db';
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.database');
        expect(result.database).toBe('test-db');
      });

      it('should get database.autoLoadEntities from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.autoLoadEntities') return true;
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.autoLoadEntities');
        expect(result.autoLoadEntities).toBe(true);
      });

      it('should get database.synchronize from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.synchronize') return false;
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.synchronize');
        expect(result.synchronize).toBe(false);
      });

      it('should get database.logging from config service', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === 'database.logging') return true;
          return undefined;
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(mockConfigService.get).toHaveBeenCalledWith('database.logging');
        expect(result.logging).toBe(true);
      });

      it('should return complete TypeORM configuration', () => {
        mockConfigService.get.mockImplementation((key: string) => {
          const configMap: Record<string, unknown> = {
            'database.url': 'postgresql://user:pass@localhost:5432/db',
            'database.host': 'localhost',
            'database.port': 5432,
            'database.username': 'user',
            'database.password': 'pass',
            'database.database': 'db',
            'database.autoLoadEntities': true,
            'database.synchronize': false,
            'database.logging': true,
          };
          return configMap[key];
        });

        const factory = typeOrmAsyncConfig.useFactory as (
          configService: ConfigService,
        ) => Record<string, unknown>;
        const result = factory(mockConfigService);

        expect(result).toEqual({
          type: 'postgres',
          url: 'postgresql://user:pass@localhost:5432/db',
          host: 'localhost',
          port: 5432,
          username: 'user',
          password: 'pass',
          database: 'db',
          autoLoadEntities: true,
          synchronize: false,
          logging: true,
        });
      });
    });
  });
});
