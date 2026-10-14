import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DevoteeFeedbackDto } from './dto/devotee-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(dto: DevoteeFeedbackDto) {
    const feedback = await this.prisma.devoteeFeedback.create({
      data: {
        devoteeName: dto.name,
        email: dto.email,
        mobile: dto.phone,
        category: dto.category,
        message: dto.message,
      },
    });

    return {
      success: true,
      message: 'Feedback submitted successfully. Thank you for your valuable guidance.',
      feedbackId: feedback.id,
    };
  }

  async getAllFeedback() {
    return this.prisma.devoteeFeedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
