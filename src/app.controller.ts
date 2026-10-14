import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & Status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'System health check and operational status' })
  getHealth() {
    return {
      status: 'UP',
      temple: 'Shri Omkareshwar Jyotirlinga Official Service',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    };
  }
}
