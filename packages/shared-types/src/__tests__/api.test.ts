import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  isApiError,
  isValidationError,
} from '../api';

describe('Pagination constants', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_PAGE).toBe(1);
    expect(DEFAULT_PAGE_SIZE).toBe(25);
    expect(MAX_PAGE_SIZE).toBe(100);
  });
});

describe('isApiError', () => {
  it('should return true for valid ApiError', () => {
    const error = {
      message: 'Something went wrong',
      statusCode: 400,
    };
    expect(isApiError(error)).toBe(true);
  });

  it('should return true for ApiError with optional error field', () => {
    const error = {
      message: 'Something went wrong',
      statusCode: 400,
      error: 'Bad Request',
    };
    expect(isApiError(error)).toBe(true);
  });

  it('should return false for invalid objects', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError(123)).toBe(false);
    expect(isApiError({})).toBe(false);
    expect(isApiError({ message: 'test' })).toBe(false);
    expect(isApiError({ statusCode: 400 })).toBe(false);
    expect(isApiError({ message: 123, statusCode: 400 })).toBe(false);
    expect(isApiError({ message: 'test', statusCode: '400' })).toBe(false);
  });
});

describe('isValidationError', () => {
  it('should return true for valid ValidationError', () => {
    const error = {
      message: 'Validation failed',
      statusCode: 422,
      errors: {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password is too short'],
      },
    };
    expect(isValidationError(error)).toBe(true);
  });

  it('should return false for ApiError without errors field', () => {
    const error = {
      message: 'Something went wrong',
      statusCode: 400,
    };
    expect(isValidationError(error)).toBe(false);
  });

  it('should return false for invalid objects', () => {
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError({ message: 'test', statusCode: 400, errors: 'string' })).toBe(false);
  });
});
