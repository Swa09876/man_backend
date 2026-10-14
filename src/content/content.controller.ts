import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('Temple Administration')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('news')
  @ApiOperation({ summary: 'Get latest temple announcements and press releases' })
  async getNews() {
    return this.contentService.getNews();
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get temple daily ritual, Aarti, and Darshan timetable' })
  async getSchedules() {
    return this.contentService.getSchedules();
  }

  @Get('live-darshan')
  @ApiOperation({ summary: 'Get Live Darshan YouTube stream details and session hours' })
  async getLiveDarshanInfo() {
    return this.contentService.getLiveDarshanInfo();
  }

  @Get('faqs')
  @ApiOperation({ summary: 'Frequently Asked Questions about Darshan, Booking, and Sevas' })
  async getFaqs() {
    return this.contentService.getFaqs();
  }

  @Get('administration')
  @ApiOperation({ summary: 'Temple Trust governance and administrative officer details' })
  async getTrustAdministration() {
    return this.contentService.getTrustAdministration();
  }
}
