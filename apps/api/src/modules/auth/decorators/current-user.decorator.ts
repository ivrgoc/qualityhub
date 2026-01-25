import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Decorator to extract the current authenticated user from the request.
 *
 * @example
 * // Get the entire user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * // Get a specific property from the user
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | User[keyof User] | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: User | undefined = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
