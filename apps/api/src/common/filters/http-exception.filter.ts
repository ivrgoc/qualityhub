import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Standardized error response format for all HTTP exceptions.
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  method: string;
  details?: string[] | Record<string, unknown>;
}

/**
 * Global exception filter that catches all HttpExceptions and formats them
 * into a consistent error response structure.
 *
 * This filter ensures all API errors follow the same format, making it easier
 * for clients to handle errors consistently.
 *
 * @example
 * // Response format for a validation error:
 * {
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "error": "Bad Request",
 *   "timestamp": "2026-01-25T12:00:00.000Z",
 *   "path": "/api/v1/users",
 *   "method": "POST",
 *   "details": ["email must be a valid email", "password is too short"]
 * }
 *
 * @example
 * // Apply globally in main.ts:
 * app.useGlobalFilters(new HttpExceptionFilter());
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: this.extractMessage(exceptionResponse),
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Add validation details if present
    const details = this.extractDetails(exceptionResponse);
    if (details) {
      errorResponse.details = details;
    }

    // Log the error with appropriate level
    this.logError(status, errorResponse, exception);

    response.status(status).json(errorResponse);
  }

  /**
   * Extracts the main error message from the exception response.
   */
  private extractMessage(exceptionResponse: string | object): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as Record<string, unknown>;

      // Handle class-validator errors with message array
      if (Array.isArray(response.message)) {
        return response.message.length > 0
          ? String(response.message[0])
          : 'Validation failed';
      }

      if (typeof response.message === 'string') {
        return response.message;
      }
    }

    return 'An error occurred';
  }

  /**
   * Extracts additional error details if available.
   * This is useful for validation errors that may have multiple issues.
   */
  private extractDetails(
    exceptionResponse: string | object,
  ): string[] | Record<string, unknown> | undefined {
    if (typeof exceptionResponse !== 'object' || exceptionResponse === null) {
      return undefined;
    }

    const response = exceptionResponse as Record<string, unknown>;

    // Handle class-validator errors which return message as array
    if (Array.isArray(response.message) && response.message.length > 1) {
      return response.message.map(String);
    }

    // Handle custom error details if provided
    if (response.details) {
      return response.details as string[] | Record<string, unknown>;
    }

    return undefined;
  }

  /**
   * Maps HTTP status codes to standardized error names.
   */
  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
    };

    return errorNames[status] || 'Error';
  }

  /**
   * Logs the error with appropriate severity level.
   * Server errors (5xx) are logged as errors, client errors (4xx) as warnings.
   */
  private logError(
    status: number,
    errorResponse: ErrorResponse,
    exception: HttpException,
  ): void {
    const logContext = {
      statusCode: status,
      path: errorResponse.path,
      method: errorResponse.method,
      message: errorResponse.message,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${errorResponse.method} ${errorResponse.path} - ${status} ${errorResponse.error}`,
        exception.stack,
        JSON.stringify(logContext),
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(
        `${errorResponse.method} ${errorResponse.path} - ${status} ${errorResponse.error}`,
        JSON.stringify(logContext),
      );
    }
  }
}
