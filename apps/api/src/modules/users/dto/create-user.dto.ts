import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
