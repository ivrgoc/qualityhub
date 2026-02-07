import { IsEmail, IsString, MinLength, MaxLength, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsUUID()
  organizationId: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
