import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AddResultDto } from './add-result.dto';
import { TestStatus } from '../entities/test-result.entity';

describe('AddResultDto', () => {
  const transformAndValidate = async (
    plain: Record<string, unknown>,
  ): Promise<{ instance: AddResultDto; errors: string[] }> => {
    const instance = plainToInstance(AddResultDto, plain);
    const validationErrors = await validate(instance);
    const errors = validationErrors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    return { instance, errors };
  };

  const validData = {
    status: TestStatus.PASSED,
    comment: 'Test passed successfully',
    elapsedSeconds: 120,
    defects: ['BUG-123'],
  };

  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const { instance, errors } = await transformAndValidate(validData);
      expect(errors).toHaveLength(0);
      expect(instance.status).toBe(TestStatus.PASSED);
      expect(instance.comment).toBe('Test passed successfully');
      expect(instance.elapsedSeconds).toBe(120);
      expect(instance.defects).toEqual(['BUG-123']);
    });

    it('should pass validation with only required status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with status and comment', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        comment: 'Assertion failed',
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with status and elapsed time', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: 60,
      });
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with status and defects', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: ['BUG-123', 'BUG-456'],
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('status validation', () => {
    it('should accept PASSED status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept FAILED status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept BLOCKED status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.BLOCKED,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept RETEST status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.RETEST,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept SKIPPED status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.SKIPPED,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept UNTESTED status', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.UNTESTED,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid status', async () => {
      const { errors } = await transformAndValidate({
        status: 'invalid_status',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing status', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject null status', async () => {
      const { errors } = await transformAndValidate({
        status: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty string status', async () => {
      const { errors } = await transformAndValidate({
        status: '',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject numeric status', async () => {
      const { errors } = await transformAndValidate({
        status: 1,
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('comment validation', () => {
    it('should accept valid comment', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: 'All assertions passed',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty comment', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: '',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept comment at max length (5000)', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: 'A'.repeat(5000),
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject comment exceeding max length', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: 'A'.repeat(5001),
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string comment', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: 12345,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept multiline comment', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        comment: 'Line 1\nLine 2\nLine 3',
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept comment with special characters', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: 'Test <script>alert("xss")</script> passed',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('elapsedSeconds validation', () => {
    it('should accept valid elapsed time', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: 120,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept zero elapsed time', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: 0,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept max elapsed time (86400 - 24 hours)', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: 86400,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject elapsed time exceeding max', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: 86401,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative elapsed time', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: -1,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-integer elapsed time', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: 120.5,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject string elapsed time', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        elapsedSeconds: '120',
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('defects validation', () => {
    it('should accept valid defects array', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: ['BUG-123', 'BUG-456'],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept empty defects array', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        defects: [],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept single defect', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: ['BUG-123'],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept defects array at max size (100)', async () => {
      const defects = Array.from({ length: 100 }, (_, i) => `BUG-${i + 1}`);
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects,
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject defects array exceeding max size', async () => {
      const defects = Array.from({ length: 101 }, (_, i) => `BUG-${i + 1}`);
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-array defects', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: 'BUG-123',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject defects with non-string elements', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: [123, 456],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject defect ID exceeding max length', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: ['A'.repeat(101)],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept defect ID at max length (100)', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: ['A'.repeat(100)],
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept various defect ID formats', async () => {
      const { errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        defects: ['BUG-123', 'JIRA-456', 'ISSUE_789', 'gh#100'],
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('combined validation', () => {
    it('should report multiple validation errors', async () => {
      const { errors } = await transformAndValidate({
        status: 'invalid',
        comment: 12345,
        elapsedSeconds: -100,
        defects: 'not-an-array',
      });
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty object', async () => {
      const { errors } = await transformAndValidate({});
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle null values', async () => {
      const { errors } = await transformAndValidate({
        status: null,
        comment: null,
        elapsedSeconds: null,
        defects: null,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should transform and validate complete result correctly', async () => {
      const { instance, errors } = await transformAndValidate({
        status: TestStatus.FAILED,
        comment: 'Test failed due to assertion error in step 3',
        elapsedSeconds: 45,
        defects: ['BUG-001', 'BUG-002'],
      });
      expect(errors).toHaveLength(0);
      expect(instance.status).toBe(TestStatus.FAILED);
      expect(instance.comment).toBe('Test failed due to assertion error in step 3');
      expect(instance.elapsedSeconds).toBe(45);
      expect(instance.defects).toEqual(['BUG-001', 'BUG-002']);
    });

    it('should accept undefined optional fields', async () => {
      const { instance, errors } = await transformAndValidate({
        status: TestStatus.PASSED,
        comment: undefined,
        elapsedSeconds: undefined,
        defects: undefined,
      });
      expect(errors).toHaveLength(0);
      expect(instance.status).toBe(TestStatus.PASSED);
      expect(instance.comment).toBeUndefined();
      expect(instance.elapsedSeconds).toBeUndefined();
      expect(instance.defects).toBeUndefined();
    });
  });
});
