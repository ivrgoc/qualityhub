import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateBddDto } from './generate-bdd.dto';

describe('GenerateBddDto', () => {
  describe('validation', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        context: 'Email verification required',
        max_scenarios: 3,
        include_examples: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only required fields', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when feature_description is too short', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description: 'Short',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('feature_description');
    });

    it('should fail when feature_description is missing', async () => {
      const dto = plainToInstance(GenerateBddDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'feature_description')).toBe(
        true,
      );
    });

    it('should fail when max_scenarios is less than 1', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        max_scenarios: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('max_scenarios');
    });

    it('should fail when max_scenarios is greater than 10', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        max_scenarios: 11,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('max_scenarios');
    });

    it('should accept max_scenarios boundary values', async () => {
      const dto1 = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        max_scenarios: 1,
      });

      const dto2 = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        max_scenarios: 10,
      });

      const errors1 = await validate(dto1);
      const errors2 = await validate(dto2);

      expect(errors1).toHaveLength(0);
      expect(errors2).toHaveLength(0);
    });

    it('should fail when include_examples is not a boolean', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        include_examples: 'yes',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('include_examples');
    });

    it('should accept both true and false for include_examples', async () => {
      const dtoTrue = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        include_examples: true,
      });

      const dtoFalse = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        include_examples: false,
      });

      const errorsTrue = await validate(dtoTrue);
      const errorsFalse = await validate(dtoFalse);

      expect(errorsTrue).toHaveLength(0);
      expect(errorsFalse).toHaveLength(0);
    });

    it('should fail when context exceeds max length', async () => {
      const dto = plainToInstance(GenerateBddDto, {
        feature_description:
          'As a user, I want to reset my password so that I can regain access',
        context: 'x'.repeat(5001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.property).toBe('context');
    });
  });

  describe('default values', () => {
    it('should have default max_scenarios of 3', () => {
      const dto = new GenerateBddDto();
      expect(dto.max_scenarios).toBe(3);
    });

    it('should have default include_examples of true', () => {
      const dto = new GenerateBddDto();
      expect(dto.include_examples).toBe(true);
    });
  });
});
