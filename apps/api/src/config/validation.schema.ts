import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),
  API_PORT: Joi.number().port().default(3000),

  // Database
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }),
  DATABASE_HOST: Joi.string().hostname().default('localhost'),
  DATABASE_PORT: Joi.number().port().default(5432),
  POSTGRES_USER: Joi.string().default('qualityhub'),
  POSTGRES_PASSWORD: Joi.string().default('qualityhub_secret'),
  POSTGRES_DB: Joi.string().default('qualityhub'),

  // JWT Authentication
  JWT_SECRET: Joi.string().min(16).default('default-secret-change-in-production'),
  JWT_ACCESS_TOKEN_EXPIRY: Joi.number().positive().default(900),
  JWT_REFRESH_TOKEN_EXPIRY: Joi.number().positive().default(604800),

  // Redis
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .default('redis://localhost:6379'),
  REDIS_HOST: Joi.string().hostname().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
});
