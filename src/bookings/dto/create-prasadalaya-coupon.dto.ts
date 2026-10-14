import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreatePrasadalayaCouponDto {
  @ApiProperty({ example: 'thali', description: 'Meal type: thali (₹30) or khichdi (₹10)' })
  @IsString()
  @IsNotEmpty()
  mealType: string;

  @ApiProperty({ example: '2026-10-20', description: 'Date of coupon consumption' })
  @IsString()
  @IsNotEmpty()
  couponDate: string;

  @ApiProperty({ example: 'LUNCH', description: 'Session: LUNCH or DINNER' })
  @IsString()
  @IsNotEmpty()
  session: string;

  @ApiProperty({ example: 'Ramesh Patel' })
  @IsString()
  @IsNotEmpty()
  devoteeName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: 2, description: 'Number of meal coupons to issue' })
  @IsNumber()
  @Min(1)
  @Max(50)
  couponsCount: number;

  @ApiPropertyOptional({ example: 'ramesh@example.com' })
  @IsString()
  @IsOptional()
  email?: string;
}
