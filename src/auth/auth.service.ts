import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { AdminLoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.fullName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }
}
