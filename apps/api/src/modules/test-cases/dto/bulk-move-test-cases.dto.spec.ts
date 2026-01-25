import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BulkMoveTestCasesDto } from './bulk-move-test-cases.dto';

describe('BulkMoveTestCasesDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: BulkMoveTestCasesDto; errors: string[] }> => {
    const instance = plainToInstance(BulkMoveTestCasesDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((e) =>
      e.constraints ? Object.values(e.constraints) : [],
    );
    return { instance, errors };
  };

  const generateUuid = (suffix: number): string => {
    const hex = suffix.toString(16).padStart(12, '0');
    return `123e4567-e89b-42d3-a456-${hex}`;
  };

  const validUuid1 = generateUuid(0);
  const validUuid2 = generateUuid(1);
  const validUuid3 = generateUuid(2);
  const targetSectionId = generateUuid(99);

  describe('valid input', () => {
    it('should pass validation with valid ids and targetSectionId', async () => {
      const { instance, errors } = await transformAndValidate({
        ids: [validUuid1, validUuid2],
        targetSectionId,
      });
      expect(errors).toHaveLength(0);
      expect(instance.ids).toEqual([validUuid1, validUuid2]);
      expect(instance.targetSectionId).toBe(targetSectionId);
    });

    it('should pass validation with single id', async () => {
      const { instance, errors } = await transformAndValidate({
        ids: [validUuid1],
        targetSectionId,
      });
      expect(errors).toHaveLength(0);
      expect(instance.ids).toHaveLength(1);
    });

    it('should pass validation without targetSectionId (move to root)', async () => {
      const { instance, errors } = await transformAndValidate({
        ids: [validUuid1, validUuid2],
      });
      expect(errors).toHaveLength(0);
      expect(instance.targetSectionId).toBeUndefined();
    });

    it('should pass validation with null targetSectionId', async () => {
      const { instance, errors } = await transformAndValidate({
        ids: [validUuid1],
        targetSectionId: null,
      });
      expect(errors).toHaveLength(0);
      expect(instance.targetSectionId).toBeNull();
    });

    it('should pass validation with 100 ids (max limit)', async () => {
      const ids = Array.from({ length: 100 }, (_, i) => generateUuid(i));
      const { errors } = await transformAndValidate({
        ids,
        targetSectionId,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('ids validation', () => {
    it('should reject empty ids array', async () => {
      const { errors } = await transformAndValidate({
        ids: [],
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('at least 1'))).toBe(true);
    });

    it('should reject missing ids', async () => {
      const { errors } = await transformAndValidate({
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-array ids', async () => {
      const { errors } = await transformAndValidate({
        ids: 'not-an-array',
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid UUID format in ids', async () => {
      const { errors } = await transformAndValidate({
        ids: ['invalid-uuid', validUuid1],
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string values in ids array', async () => {
      const { errors } = await transformAndValidate({
        ids: [123, validUuid1],
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject more than 100 ids', async () => {
      const ids = Array.from({ length: 101 }, (_, i) => generateUuid(i));
      const { errors } = await transformAndValidate({
        ids,
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('100'))).toBe(true);
    });

    it('should reject array with all invalid UUIDs', async () => {
      const { errors } = await transformAndValidate({
        ids: ['not-uuid-1', 'not-uuid-2'],
        targetSectionId,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('targetSectionId validation', () => {
    it('should reject invalid UUID format for targetSectionId', async () => {
      const { errors } = await transformAndValidate({
        ids: [validUuid1],
        targetSectionId: 'invalid-uuid',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string targetSectionId', async () => {
      const { errors } = await transformAndValidate({
        ids: [validUuid1],
        targetSectionId: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty string targetSectionId', async () => {
      const { errors } = await transformAndValidate({
        ids: [validUuid1],
        targetSectionId: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined validation', () => {
    it('should report errors for both invalid ids and targetSectionId', async () => {
      const { errors } = await transformAndValidate({
        ids: ['invalid-uuid'],
        targetSectionId: 'also-invalid',
      });
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should transform and validate complete valid input correctly', async () => {
      const { instance, errors } = await transformAndValidate({
        ids: [validUuid1, validUuid2, validUuid3],
        targetSectionId,
      });
      expect(errors).toHaveLength(0);
      expect(instance.ids).toHaveLength(3);
      expect(instance.ids).toContain(validUuid1);
      expect(instance.ids).toContain(validUuid2);
      expect(instance.ids).toContain(validUuid3);
      expect(instance.targetSectionId).toBe(targetSectionId);
    });
  });
});
