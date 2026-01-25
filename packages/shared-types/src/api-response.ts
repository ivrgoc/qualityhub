/**
 * Generic API response wrapper for successful responses
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Error response structure for API errors
 */
export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as ErrorResponse).success === false &&
    'message' in value &&
    'statusCode' in value &&
    typeof (value as ErrorResponse).message === 'string' &&
    typeof (value as ErrorResponse).statusCode === 'number'
  );
}

/**
 * Type guard to check if a response is a successful API response
 */
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as ApiResponse<T>).success === true &&
    'data' in value
  );
}

/**
 * Type guard to check if a response is a paginated response
 */
export function isPaginatedResponse<T>(value: unknown): value is PaginatedResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    'total' in value &&
    'page' in value &&
    'pageSize' in value &&
    'totalPages' in value &&
    Array.isArray((value as PaginatedResponse<T>).items) &&
    typeof (value as PaginatedResponse<T>).total === 'number' &&
    typeof (value as PaginatedResponse<T>).page === 'number' &&
    typeof (value as PaginatedResponse<T>).pageSize === 'number' &&
    typeof (value as PaginatedResponse<T>).totalPages === 'number'
  );
}
