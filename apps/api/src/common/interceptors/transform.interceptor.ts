import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standardized success response format for all API responses.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Global interceptor that transforms all successful responses into a
 * consistent format with success flag, data, and timestamp.
 *
 * This interceptor ensures all API responses follow the same structure,
 * making it easier for clients to handle responses consistently.
 *
 * @example
 * // Original controller response:
 * { id: '1', name: 'Test Project' }
 *
 * // Transformed response:
 * {
 *   "success": true,
 *   "data": { "id": "1", "name": "Test Project" },
 *   "timestamp": "2026-01-25T12:00:00.000Z"
 * }
 *
 * @example
 * // Apply globally in main.ts:
 * app.useGlobalInterceptors(new TransformInterceptor());
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
