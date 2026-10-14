import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsEmail, IsOptional } from 'class-validator';

export class Claim80GDto {
  @ApiProperty({ example: 'Sunil' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Gupta' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'ABCDE1234F' })
  @IsString()
  @IsNotEmpty()
  pan: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsString()
  @IsOptional()
  aadhar?: string;

  @ApiProperty({ example: 'sunil@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({ example: 'Indore, MP' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'sunil@upi' })
  @IsString()
  @IsOptional()
  upiId?: string;

  @ApiProperty({ example: 'UTR2026101189382' })
  @IsString()
  @IsNotEmpty()
  utrNumber: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({ example: '2026-10-10' })
  @IsString()
  @IsNotEmpty()
  donationDate: string;
}
