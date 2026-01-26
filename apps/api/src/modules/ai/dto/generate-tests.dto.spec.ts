import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateTestsDto } from './generate-tests.dto';

describe('GenerateTestsDto', () => {
  describe('validation', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'User should be able to login with email and password',
        context: 'Web application',
        test_type: 'all',
        max_tests: 5,
        priority: 'high',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only required fields', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'User should be able to login with email and password',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when description is too short', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'Short',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('description');
    });

    it('should fail when description is missing', async () => {
      const dto = plainToInstance(GenerateTestsDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('should fail when test_type is invalid', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'User should be able to login with email and password',
        test_type: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('test_type');
    });

    it('should fail when max_tests is less than 1', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'User should be able to login with email and password',
        max_tests: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('max_tests');
    });

    it('should fail when max_tests is greater than 20', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'User should be able to login with email and password',
        max_tests: 21,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('max_tests');
    });

    it('should fail when priority is invalid', async () => {
      const dto = plainToInstance(GenerateTestsDto, {
        description: 'User should be able to login with email and password',
        priority: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('priority');
    });

    it('should accept all valid test_type values', async () => {
      const testTypes = ['functional', 'edge_case', 'negative', 'all'];

      for (const testType of testTypes) {
        const dto = plainToInstance(GenerateTestsDto, {
          description: 'User should be able to login with email and password',
          test_type: testType,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should accept all valid priority values', async () => {
      const priorities = ['critical', 'high', 'medium', 'low'];

      for (const priority of priorities) {
        const dto = plainToInstance(GenerateTestsDto, {
          description: 'User should be able to login with email and password',
          priority,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('default values', () => {
    it('should have default test_type of "all"', () => {
      const dto = new GenerateTestsDto();
      expect(dto.test_type).toBe('all');
    });

    it('should have default max_tests of 5', () => {
      const dto = new GenerateTestsDto();
      expect(dto.max_tests).toBe(5);
    });
  });
});
