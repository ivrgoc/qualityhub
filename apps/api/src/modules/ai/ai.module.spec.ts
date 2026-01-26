import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AiModule } from './ai.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

describe('AiModule', () => {
  let module: TestingModule;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config: Record<string, string | number> = {
        AI_SERVICE_URL: 'http://localhost:8000',
        AI_SERVICE_TIMEOUT: 60000,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AiModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide AiService', () => {
    const service = module.get<AiService>(AiService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AiService);
  });

  it('should provide AiController', () => {
    const controller = module.get<AiController>(AiController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AiController);
  });

  it('should provide HttpService', () => {
    const httpService = module.get<HttpService>(HttpService);
    expect(httpService).toBeDefined();
  });

  describe('HttpModule configuration', () => {
    it('should use AI_SERVICE_URL from config', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('AI_SERVICE_URL');
    });

    it('should use AI_SERVICE_TIMEOUT from config', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('AI_SERVICE_TIMEOUT');
    });
  });

  describe('default configuration', () => {
    let moduleWithDefaults: TestingModule;

    beforeEach(async () => {
      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      moduleWithDefaults = await Test.createTestingModule({
        imports: [AiModule],
      })
        .overrideProvider(ConfigService)
        .useValue(emptyConfigService)
        .compile();
    });

    afterEach(async () => {
      if (moduleWithDefaults) {
        await moduleWithDefaults.close();
      }
    });

    it('should compile with default values when config is not set', () => {
      expect(moduleWithDefaults).toBeDefined();
      const service = moduleWithDefaults.get<AiService>(AiService);
      expect(service).toBeDefined();
    });
  });
});
