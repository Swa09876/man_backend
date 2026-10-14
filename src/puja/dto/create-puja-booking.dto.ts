import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePujaBookingDto {
  @ApiProperty({ example: 'Abhishek Pooja' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Jalabhishek 1 Brahmin' })
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty({ example: '2026-10-16' })
  @IsString()
  @IsNotEmpty()
  pujaDate: string;

  @ApiProperty({ example: 'Kashyap' })
  @IsString()
  @IsOptional()
  gotra?: string;

  @ApiProperty({ example: 'Ramesh Sharma Family' })
  @IsString()
  @IsOptional()
  sankalpName?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  totalPerson: number;

  @ApiProperty({ example: 'Ramesh' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({ example: 'ramesh@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsString()
  @IsOptional()
  idProofNumber?: string;

  @ApiPropertyOptional({ example: 'Indore' })
  @IsString()
  @IsOptional()
  address?: string;
}
