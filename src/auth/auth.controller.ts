import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login and JWT token generation' })
  @ApiResponse({ status: 200, description: 'Signed JWT token and admin profile.' })
  async login(@Body() dto: AdminLoginDto) {
    return this.authService.validateAdmin(dto);
  }
}
