import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & Status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API root welcome and operational status' })
  getApiRoot() {
    return {
      status: 'success',
      service: 'Shri Omkareshwar Jyotirlinga Official REST API',
      version: '1.0.0',
      message: 'API is online and operational',
      documentation: '/api/docs',
      health: '/api/v1/health',
      timestamp: new Date().toISOString(),
    };
  }

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
