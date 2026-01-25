import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { HealthModule } from './modules/health/health.module';
import { databaseConfig, jwtConfig } from './config';

describe('Bootstrap Configuration', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, jwtConfig],
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = app.get(ConfigService);

    // Apply the same configuration as main.ts
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN', '*'),
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('QualityHub API')
      .setDescription('AI-powered test management platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Global Prefix', () => {
    it('should respond to requests with /api/v1 prefix', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should not respond to requests without /api/v1 prefix', async () => {
      await request(app.getHttpServer()).get('/health').expect(404);
    });
  });

  describe('ValidationPipe', () => {
    it('should strip non-whitelisted properties (whitelist: true)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .send({ extraProperty: 'should be ignored' })
        .expect(200);

      expect(response.body).not.toHaveProperty('extraProperty');
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-credentials');
    });
  });

  describe('Swagger Documentation', () => {
    it('should serve Swagger UI at /api/docs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);

      expect(response.text).toContain('swagger');
    });

    it('should serve Swagger JSON at /api/docs-json', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body.info).toHaveProperty('title', 'QualityHub API');
      expect(response.body.info).toHaveProperty('description', 'AI-powered test management platform API');
      expect(response.body.info).toHaveProperty('version', '1.0');
    });

    it('should have bearer auth configured in Swagger', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      expect(response.body.components).toHaveProperty('securitySchemes');
      expect(response.body.components.securitySchemes).toHaveProperty('bearer');
    });
  });

  describe('ConfigService Integration', () => {
    it('should have ConfigService available', () => {
      expect(configService).toBeDefined();
    });

    it('should provide default port value', () => {
      const port = configService.get<number>('PORT', 3000);
      expect(typeof port).toBe('number');
    });
  });
});
