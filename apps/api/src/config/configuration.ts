import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  type: 'postgres';
  url?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  autoLoadEntities: boolean;
  synchronize: boolean;
  logging: boolean;
}

export interface JwtConfig {
  secret: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
}

export interface StorageConfig {
  type: 'local' | 's3';
  local: {
    uploadDir: string;
  };
  s3: {
    bucket: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
  };
}

export interface Configuration {
  database: DatabaseConfig;
  jwt: JwtConfig;
  redis: RedisConfig;
  app: AppConfig;
  storage: StorageConfig;
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'qualityhub',
    password: process.env.POSTGRES_PASSWORD || 'qualityhub_secret',
    database: process.env.POSTGRES_DB || 'qualityhub',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  }),
);

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    accessTokenExpiry: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRY || '900',
      10,
    ),
    refreshTokenExpiry: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRY || '604800',
      10,
    ),
  }),
);

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  }),
);

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.API_PORT || '3000', 10),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  }),
);

export const storageConfig = registerAs(
  'storage',
  (): StorageConfig => ({
    type: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
    local: {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
    },
    s3: {
      bucket: process.env.AWS_S3_BUCKET || '',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_S3_ENDPOINT,
    },
  }),
);

export default (): Configuration => ({
  database: databaseConfig(),
  jwt: jwtConfig(),
  redis: redisConfig(),
  app: appConfig(),
  storage: storageConfig(),
});
