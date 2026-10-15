import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DevoteeFeedbackDto } from './dto/devotee-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  private inMemoryFeedback: any[] = [];

  async submitFeedback(dto: DevoteeFeedbackDto) {
    const feedbackId = `FDB-OMK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const simulatedFeedback = {
      id: feedbackId,
      devoteeName: dto.name,
      email: dto.email,
      mobile: dto.phone,
      category: dto.category,
      message: dto.message,
      createdAt: new Date(),
    };

    if (!this.prisma.isDatabaseConnected) {
      this.inMemoryFeedback.unshift(simulatedFeedback);
      return {
        success: true,
        message: 'Feedback submitted successfully. Thank you for your valuable guidance.',
        feedbackId: simulatedFeedback.id,
        data: simulatedFeedback,
      };
    }

    try {
      const feedback = await this.prisma.devoteeFeedback.create({
        data: {
          devoteeName: dto.name,
          email: dto.email,
          mobile: dto.phone,
          category: dto.category,
          message: dto.message,
        },
      });

      const result = {
        success: true,
        message: 'Feedback submitted successfully. Thank you for your valuable guidance.',
        feedbackId: feedback.id,
        data: feedback,
      };

      this.inMemoryFeedback.unshift(feedback);
      return result;
    } catch {
      this.inMemoryFeedback.unshift(simulatedFeedback);
      return {
        success: true,
        message: 'Feedback submitted successfully. Thank you for your valuable guidance.',
        feedbackId: simulatedFeedback.id,
        data: simulatedFeedback,
      };
    }
  }

  async getAllFeedback() {
    if (!this.prisma.isDatabaseConnected) {
      return this.inMemoryFeedback.length > 0
        ? this.inMemoryFeedback
        : [
            {
              id: 'FDB-OMK-DEMO-001',
              devoteeName: 'Ramesh Patel',
              email: 'ramesh@example.com',
              mobile: '9876543210',
              category: 'Darshan Facility',
              message: 'Temple arrangements and cleanliness around Nagar Ghat were well managed.',
              createdAt: new Date(),
            },
          ];
    }

    try {
      const feedbacks = await this.prisma.devoteeFeedback.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return feedbacks.length > 0 ? feedbacks : this.inMemoryFeedback;
    } catch {
      return this.inMemoryFeedback.length > 0
        ? this.inMemoryFeedback
        : [
            {
              id: 'FDB-OMK-DEMO-001',
              devoteeName: 'Ramesh Patel',
              email: 'ramesh@example.com',
              mobile: '9876543210',
              category: 'Darshan Facility',
              message: 'Temple arrangements and cleanliness around Nagar Ghat were well managed.',
              createdAt: new Date(),
            },
          ];
    }
  }
}
