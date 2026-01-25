import { UserRole } from '../enums';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
}
