import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateVishramalayaBookingDto {
  @ApiProperty({ example: 'night-stay', description: 'Stay type: night-stay or day-stay' })
  @IsString()
  @IsNotEmpty()
  stayType: string;

  @ApiProperty({ example: '2026-10-20', description: 'Date of accommodation check-in' })
  @IsString()
  @IsNotEmpty()
  stayDate: string;

  @ApiProperty({ example: 'Suresh Kumar Sharma' })
  @IsString()
  @IsNotEmpty()
  devoteeName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: 2, description: 'Number of yatris / pilgrims' })
  @IsNumber()
  @Min(1)
  @Max(20)
  persons: number;

  @ApiPropertyOptional({ example: '123456789012', description: 'Aadhaar / Voter ID Number' })
  @IsString()
  @IsOptional()
  idProof?: string;

  @ApiPropertyOptional({ example: 'suresh@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Bhopal, MP' })
  @IsString()
  @IsOptional()
  address?: string;
}
