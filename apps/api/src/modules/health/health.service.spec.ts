import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return health response with status ok', () => {
      const result = service.check();

      expect(result.status).toBe('ok');
    });

    it('should return health response with timestamp', () => {
      const result = service.check();

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return health response with version', () => {
      const result = service.check();

      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
    });
  });
});
