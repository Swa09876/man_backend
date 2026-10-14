import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Shri Omkareshwar Jyotirlinga API')
    .setDescription(
      'Official REST API for Shri Omkareshwar Temple website recreation. Covers Darshan Ticket Booking, Puja Services, E-Aradhana, Vishramalaya Accommodation, Prasadalaya, Mahaprasad Store, and Donations.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Darshan & Tickets', 'Shighra Darshan booking, slot availability, and ticket retrieval')
    .addTag('Puja & E-Aradhana', 'Abhishek, Rudrabhishek, and remote Sankalp puja services')
    .addTag('Donations & 80G', 'Seva donations and tax exemption certificate issuance')
    .addTag('Mahaprasad Store', 'Laddu prasad box e-commerce and Speed Post delivery tracking')
    .addTag('Temple Administration', 'Trust management, schedules, and official content')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Shri Omkareshwar API Server running at http://localhost:${port}/api/v1`);
  logger.log(`Swagger OpenAPI Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
