import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateDarshanBookingDto } from './dto/create-darshan-booking.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { TicketReprintDto, FindBookingDto } from './dto/verify-ticket.dto';
import { CreateVishramalayaBookingDto } from './dto/create-vishramalaya-booking.dto';
import { CreatePrasadalayaCouponDto } from './dto/create-prasadalaya-coupon.dto';

@ApiTags('Darshan & Tickets')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('darshan')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Shighra Darshan Ticket Booking' })
  @ApiResponse({ status: 201, description: 'Ticket booked successfully with QR code and confirmation ref.' })
  async createBooking(@Body() dto: CreateDarshanBookingDto) {
    return this.bookingsService.createBooking(dto);
  }

  @Post('vishramalaya')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book Vishramalaya pilgrim accommodation stay' })
  @ApiResponse({ status: 201, description: 'Accommodation booking created and confirmed.' })
  async bookVishramalaya(@Body() dto: CreateVishramalayaBookingDto) {
    return this.bookingsService.bookVishramalaya(dto);
  }

  @Post('prasadalaya')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book subsidized Prasadalaya meal coupons' })
  @ApiResponse({ status: 201, description: 'Meal coupons generated with receipt.' })
  async bookPrasadalaya(@Body() dto: CreatePrasadalayaCouponDto) {
    return this.bookingsService.bookPrasadalaya(dto);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Check real-time ticket slot quota and availability' })
  @ApiResponse({ status: 200, description: 'Current quota availability for selected date and slot.' })
  async checkAvailability(@Query() dto: CheckAvailabilityDto) {
    return this.bookingsService.checkAvailability(dto);
  }

  @Post('ticket-reprint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reprint or download existing Darshan ticket' })
  @ApiResponse({ status: 200, description: 'Verified ticket details and QR payload.' })
  async reprintTicket(@Body() dto: TicketReprintDto) {
    return this.bookingsService.reprintTicket(dto);
  }

  @Post('find-booking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find devotee bookings by Mobile and Aadhaar' })
  @ApiResponse({ status: 200, description: 'List of matching devotee bookings.' })
  async findBooking(@Body() dto: FindBookingDto) {
    return this.bookingsService.findBooking(dto);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all darshan bookings (Admin/Counter)' })
  async getAllBookings(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.bookingsService.getAllBookings(parseInt(page, 10), parseInt(limit, 10));
  }
}
