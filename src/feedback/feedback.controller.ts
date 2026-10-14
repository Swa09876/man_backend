import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { DevoteeFeedbackDto } from './dto/devotee-feedback.dto';

@ApiTags('Devotee Support & Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit feedback, suggestions, or grievance' })
  @ApiResponse({ status: 201, description: 'Feedback received.' })
  async submitFeedback(@Body() dto: DevoteeFeedbackDto) {
    return this.feedbackService.submitFeedback(dto);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all feedbacks for admin review' })
  async getAllFeedback() {
    return this.feedbackService.getAllFeedback();
  }
}
