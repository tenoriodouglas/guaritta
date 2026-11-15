import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository.js';
import type { AuthUser } from './auth-user.js';
import { LoginDto } from './dto/login.dto.js';
import { verifyPassword } from './password.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthUser }> {
    const user = await this.users.findByEmailWithUnit(dto.email);
    // Same error for unknown user and bad password to avoid account enumeration.
    if (!user?.active || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: AuthUser = { sub: user.id, role: user.role, unitId: user.unitId ?? undefined };
    return { accessToken: await this.jwt.signAsync(payload), user: payload };
  }
}
