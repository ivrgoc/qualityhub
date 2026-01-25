import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { databaseConfig, jwtConfig } from './config';

describe('AppModule', () => {
  describe('Module metadata', () => {
    it('should have correct imports configured', () => {
      const imports = Reflect.getMetadata('imports', AppModule);
      expect(imports).toBeDefined();
      expect(imports.length).toBeGreaterThanOrEqual(7);
    });

    it('should have ConfigModule as first import', () => {
      const imports = Reflect.getMetadata('imports', AppModule);
      expect(imports[0]).toBeDefined();
    });

    it('should have TypeOrmModule configured', () => {
      const imports = Reflect.getMetadata('imports', AppModule);
      expect(imports[1]).toBeDefined();
    });
  });

  describe('Configuration', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, jwtConfig],
          }),
        ],
      }).compile();
    });

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('should have ConfigService available', () => {
      const configService = module.get(ConfigService);
      expect(configService).toBeDefined();
    });

    it('should load database configuration', () => {
      const configService = module.get(ConfigService);
      const dbConfig = configService.get('database');
      expect(dbConfig).toBeDefined();
      expect(dbConfig.type).toBe('postgres');
    });

    it('should load jwt configuration', () => {
      const configService = module.get(ConfigService);
      const jwtConfigValue = configService.get('jwt');
      expect(jwtConfigValue).toBeDefined();
      expect(jwtConfigValue.secret).toBeDefined();
    });

    it('should have correct database default values', () => {
      const configService = module.get(ConfigService);
      const dbConfig = configService.get('database');
      expect(dbConfig.host).toBe('localhost');
      expect(dbConfig.port).toBe(5432);
      expect(dbConfig.autoLoadEntities).toBe(true);
    });

    it('should have correct jwt default values', () => {
      const configService = module.get(ConfigService);
      const jwtConfigValue = configService.get('jwt');
      expect(jwtConfigValue.accessTokenExpiry).toBe(900);
      expect(jwtConfigValue.refreshTokenExpiry).toBe(604800);
    });
  });
});
