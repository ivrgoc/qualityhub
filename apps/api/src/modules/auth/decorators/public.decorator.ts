import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public, skipping JWT authentication.
 *
 * @example
 * // Skip authentication for a single endpoint
 * @Public()
 * @Get('health')
 * getHealth() {
 *   return { status: 'ok' };
 * }
 *
 * @example
 * // Skip authentication for all endpoints in a controller
 * @Public()
 * @Controller('public')
 * export class PublicController { }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
