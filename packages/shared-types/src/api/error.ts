export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ValidationError extends ApiError {
  errors: Record<string, string[]>;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'statusCode' in value &&
    typeof (value as ApiError).message === 'string' &&
    typeof (value as ApiError).statusCode === 'number'
  );
}

export function isValidationError(value: unknown): value is ValidationError {
  return (
    isApiError(value) && 'errors' in value && typeof (value as ValidationError).errors === 'object'
  );
}
