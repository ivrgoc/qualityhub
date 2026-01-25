import { describe, it, expect } from 'vitest';
import {
  isErrorResponse,
  isApiResponse,
  isPaginatedResponse,
  type ApiResponse,
  type ErrorResponse,
  type PaginatedResponse,
} from '../api-response';

describe('ApiResponse', () => {
  it('should allow creating a valid ApiResponse', () => {
    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: '123' },
    };
    expect(response.success).toBe(true);
    expect(response.data.id).toBe('123');
  });

  it('should allow optional message and timestamp', () => {
    const response: ApiResponse<string> = {
      success: true,
      data: 'test',
      message: 'Operation successful',
      timestamp: '2026-01-25T12:00:00Z',
    };
    expect(response.message).toBe('Operation successful');
    expect(response.timestamp).toBe('2026-01-25T12:00:00Z');
  });
});

describe('PaginatedResponse', () => {
  it('should allow creating a valid PaginatedResponse', () => {
    const response: PaginatedResponse<{ name: string }> = {
      items: [{ name: 'Test 1' }, { name: 'Test 2' }],
      total: 100,
      page: 1,
      pageSize: 25,
      totalPages: 4,
    };
    expect(response.items).toHaveLength(2);
    expect(response.total).toBe(100);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(25);
    expect(response.totalPages).toBe(4);
  });

  it('should allow empty items array', () => {
    const response: PaginatedResponse<unknown> = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
    };
    expect(response.items).toHaveLength(0);
    expect(response.total).toBe(0);
  });
});

describe('ErrorResponse', () => {
  it('should allow creating a basic ErrorResponse', () => {
    const response: ErrorResponse = {
      success: false,
      message: 'Something went wrong',
      statusCode: 500,
    };
    expect(response.success).toBe(false);
    expect(response.message).toBe('Something went wrong');
    expect(response.statusCode).toBe(500);
  });

  it('should allow optional error and errors fields', () => {
    const response: ErrorResponse = {
      success: false,
      message: 'Validation failed',
      statusCode: 422,
      error: 'Unprocessable Entity',
      errors: {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password is too short'],
      },
    };
    expect(response.error).toBe('Unprocessable Entity');
    expect(response.errors?.email).toHaveLength(2);
  });

  it('should allow optional timestamp', () => {
    const response: ErrorResponse = {
      success: false,
      message: 'Not found',
      statusCode: 404,
      timestamp: '2026-01-25T12:00:00Z',
    };
    expect(response.timestamp).toBe('2026-01-25T12:00:00Z');
  });
});

describe('isErrorResponse', () => {
  it('should return true for valid ErrorResponse', () => {
    const error: ErrorResponse = {
      success: false,
      message: 'Something went wrong',
      statusCode: 400,
    };
    expect(isErrorResponse(error)).toBe(true);
  });

  it('should return true for ErrorResponse with all optional fields', () => {
    const error: ErrorResponse = {
      success: false,
      message: 'Validation failed',
      statusCode: 422,
      error: 'Unprocessable Entity',
      errors: { email: ['Invalid email'] },
      timestamp: '2026-01-25T12:00:00Z',
    };
    expect(isErrorResponse(error)).toBe(true);
  });

  it('should return false for success: true', () => {
    const response = {
      success: true,
      message: 'test',
      statusCode: 200,
    };
    expect(isErrorResponse(response)).toBe(false);
  });

  it('should return false for invalid objects', () => {
    expect(isErrorResponse(null)).toBe(false);
    expect(isErrorResponse(undefined)).toBe(false);
    expect(isErrorResponse('string')).toBe(false);
    expect(isErrorResponse(123)).toBe(false);
    expect(isErrorResponse({})).toBe(false);
    expect(isErrorResponse({ success: false })).toBe(false);
    expect(isErrorResponse({ success: false, message: 'test' })).toBe(false);
    expect(isErrorResponse({ success: false, statusCode: 400 })).toBe(false);
    expect(isErrorResponse({ success: false, message: 123, statusCode: 400 })).toBe(false);
    expect(isErrorResponse({ success: false, message: 'test', statusCode: '400' })).toBe(false);
  });
});

describe('isApiResponse', () => {
  it('should return true for valid ApiResponse', () => {
    const response: ApiResponse<string> = {
      success: true,
      data: 'test',
    };
    expect(isApiResponse(response)).toBe(true);
  });

  it('should return true for ApiResponse with optional fields', () => {
    const response: ApiResponse<{ id: number }> = {
      success: true,
      data: { id: 1 },
      message: 'Success',
      timestamp: '2026-01-25T12:00:00Z',
    };
    expect(isApiResponse(response)).toBe(true);
  });

  it('should return false for success: false', () => {
    const response = {
      success: false,
      data: 'test',
    };
    expect(isApiResponse(response)).toBe(false);
  });

  it('should return false for invalid objects', () => {
    expect(isApiResponse(null)).toBe(false);
    expect(isApiResponse(undefined)).toBe(false);
    expect(isApiResponse('string')).toBe(false);
    expect(isApiResponse(123)).toBe(false);
    expect(isApiResponse({})).toBe(false);
    expect(isApiResponse({ success: true })).toBe(false);
    expect(isApiResponse({ data: 'test' })).toBe(false);
  });
});

describe('isPaginatedResponse', () => {
  it('should return true for valid PaginatedResponse', () => {
    const response: PaginatedResponse<string> = {
      items: ['a', 'b', 'c'],
      total: 100,
      page: 1,
      pageSize: 25,
      totalPages: 4,
    };
    expect(isPaginatedResponse(response)).toBe(true);
  });

  it('should return true for empty PaginatedResponse', () => {
    const response: PaginatedResponse<unknown> = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
    };
    expect(isPaginatedResponse(response)).toBe(true);
  });

  it('should return false for invalid objects', () => {
    expect(isPaginatedResponse(null)).toBe(false);
    expect(isPaginatedResponse(undefined)).toBe(false);
    expect(isPaginatedResponse('string')).toBe(false);
    expect(isPaginatedResponse(123)).toBe(false);
    expect(isPaginatedResponse({})).toBe(false);
    expect(isPaginatedResponse({ items: [] })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: 0 })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: 0, page: 1 })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: 0, page: 1, pageSize: 25 })).toBe(false);
  });

  it('should return false for invalid field types', () => {
    expect(isPaginatedResponse({ items: 'not-array', total: 0, page: 1, pageSize: 25, totalPages: 0 })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: '0', page: 1, pageSize: 25, totalPages: 0 })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: 0, page: '1', pageSize: 25, totalPages: 0 })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: 0, page: 1, pageSize: '25', totalPages: 0 })).toBe(false);
    expect(isPaginatedResponse({ items: [], total: 0, page: 1, pageSize: 25, totalPages: '0' })).toBe(false);
  });
});
