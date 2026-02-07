import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly invalidatedTokens: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create a default organization for the new user
    const orgSlug = `org-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const organization = await this.organizationsService.create({
      name: `${registerDto.name}'s Organization`,
      slug: orgSlug,
    });

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      organizationId: organization.id,
      role: UserRole.ORG_ADMIN, // First user is org admin
    });

    const { passwordHash: _, ...result } = user;
    void _;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.organizationId, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.organizationId,
      },
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    this.invalidatedTokens.add(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    if (this.invalidatedTokens.has(refreshToken)) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate old refresh token (token rotation)
      this.invalidatedTokens.add(refreshToken);

      return this.generateTokens(user.id, user.email, user.organizationId, user.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private generateTokens(
    userId: string,
    email: string,
    orgId: string,
    role: string,
  ): { accessToken: string; refreshToken: string } {
    const payload = {
      sub: userId,
      email,
      orgId,
      role,
    };

    const accessTokenExpiry = this.configService.get<number>(
      'jwt.accessTokenExpiry',
    );
    const refreshTokenExpiry = this.configService.get<number>(
      'jwt.refreshTokenExpiry',
    );

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiry,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }
}
