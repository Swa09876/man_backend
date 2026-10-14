import { Controller, Get, Post, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PujaService } from './puja.service';
import { CreatePujaBookingDto } from './dto/create-puja-booking.dto';

@ApiTags('Puja & E-Aradhana')
@Controller('puja')
export class PujaController {
  constructor(private readonly pujaService: PujaService) {}

  @Get('services')
  @ApiOperation({ summary: 'List all temple puja ritual services and pricing' })
  @ApiResponse({ status: 200, description: 'List of active puja services.' })
  async getAllServices(@Query('category') category?: string) {
    return this.pujaService.getAllServices(category);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get puja service details by ID' })
  async getServiceById(@Param('id') id: string) {
    return this.pujaService.getServiceById(id);
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book Abhishek, Rudrabhishek or E-Pujan ritual' })
  @ApiResponse({ status: 201, description: 'Puja successfully scheduled and confirmed.' })
  async createBooking(@Body() dto: CreatePujaBookingDto) {
    return this.pujaService.createBooking(dto);
  }

  @Get('admin/bookings')
  @ApiOperation({ summary: 'List all puja bookings (Admin/Priest Office)' })
  async getAllBookings(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.pujaService.getAllBookings(parseInt(page, 10), parseInt(limit, 10));
  }
}
