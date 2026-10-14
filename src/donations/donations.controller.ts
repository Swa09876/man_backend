import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Claim80GDto } from './dto/claim-80g.dto';

@ApiTags('Donations & 80G')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all active seva donation categories' })
  async getCategories() {
    return this.donationsService.getCategories();
  }

  @Post('contribute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make online donation and generate 80G receipt' })
  @ApiResponse({ status: 201, description: 'Donation recorded and receipt generated.' })
  async createDonation(@Body() dto: CreateDonationDto) {
    return this.donationsService.createDonation(dto);
  }

  @Post('claim-80g')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit offline UTR / UPI donation for 80G claim' })
  async claim80G(@Body() dto: Claim80GDto) {
    return this.donationsService.claim80G(dto);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all donations (Admin/Accounts)' })
  async getAllDonations(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.donationsService.getAllDonations(parseInt(page, 10), parseInt(limit, 10));
  }
}
