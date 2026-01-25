import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor, ApiResponse } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformInterceptor();

    mockExecutionContext = {} as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should wrap response data in ApiResponse format', (done) => {
      const testData = { id: '1', name: 'Test Project' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toEqual(testData);
          expect(result.timestamp).toBeDefined();
          done();
        });
    });

    it('should include a valid ISO timestamp', (done) => {
      const testData = { id: '1' };
      const before = new Date().toISOString();
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          const after = new Date().toISOString();

          expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
            new Date(before).getTime(),
          );
          expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
            new Date(after).getTime(),
          );
          done();
        });
    });

    it('should handle array data', (done) => {
      const testData = [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ];
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toEqual(testData);
          expect(Array.isArray(result.data)).toBe(true);
          done();
        });
    });

    it('should handle null data', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toBeNull();
          expect(result.timestamp).toBeDefined();
          done();
        });
    });

    it('should handle undefined data', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toBeUndefined();
          expect(result.timestamp).toBeDefined();
          done();
        });
    });

    it('should handle empty object', (done) => {
      const testData = {};
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toEqual({});
          done();
        });
    });

    it('should handle primitive string data', (done) => {
      const testData = 'success';
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toBe('success');
          done();
        });
    });

    it('should handle primitive number data', (done) => {
      const testData = 42;
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toBe(42);
          done();
        });
    });

    it('should handle boolean data', (done) => {
      const testData = true;
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toBe(true);
          done();
        });
    });

    it('should handle nested object data', (done) => {
      const testData = {
        id: '1',
        project: {
          name: 'Test',
          settings: {
            enabled: true,
            count: 5,
          },
        },
        tags: ['tag1', 'tag2'],
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result) => {
          expect(result.success).toBe(true);
          expect(result.data).toEqual(testData);
          done();
        });
    });

    it('should call the handler once', (done) => {
      const testData = { id: '1' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe(() => {
          expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
          done();
        });
    });
  });

  describe('ApiResponse interface', () => {
    it('should have correct structure', (done) => {
      const testData = { id: '1', name: 'Test' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe((result: ApiResponse<typeof testData>) => {
          expect(Object.keys(result)).toHaveLength(3);
          expect(result).toHaveProperty('success');
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('timestamp');
          done();
        });
    });
  });
});
