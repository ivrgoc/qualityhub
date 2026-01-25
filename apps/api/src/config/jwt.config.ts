import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  accessTokenExpiry: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY || '900', 10),
  refreshTokenExpiry: parseInt(
    process.env.JWT_REFRESH_TOKEN_EXPIRY || '604800',
    10,
  ),
}));
