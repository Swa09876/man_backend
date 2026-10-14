import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class DevoteeFeedbackDto {
  @ApiProperty({ example: 'Ramesh Patel' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ramesh@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Darshan Facility' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Temple arrangements during Shravan were extraordinarily serene.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
