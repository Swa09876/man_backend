import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsEmail } from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({ example: 'ANN_KSHETRA' })
  @IsString()
  @IsNotEmpty()
  categoryCode: string;

  @ApiProperty({ example: 1100.0 })
  @IsNumber()
  @Min(50)
  amount: number;

  @ApiProperty({ example: 'Sunil' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Gupta' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({ example: 'sunil@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsString()
  @IsOptional()
  panNumber?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsString()
  @IsOptional()
  aadharNumber?: string;

  @ApiPropertyOptional({ example: 'Indore, MP' })
  @IsString()
  @IsOptional()
  address?: string;
}
