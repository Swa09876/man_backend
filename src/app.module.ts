import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { BookingsModule } from './bookings/bookings.module';
import { PujaModule } from './puja/puja.module';
import { DonationsModule } from './donations/donations.module';
import { OrdersModule } from './orders/orders.module';
import { ContentModule } from './content/content.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BookingsModule,
    PujaModule,
    DonationsModule,
    OrdersModule,
    ContentModule,
    FeedbackModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
