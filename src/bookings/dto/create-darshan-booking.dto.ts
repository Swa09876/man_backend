import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';

export class AttendeeDto {
  @ApiProperty({ example: 'Ramesh Sharma' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 42 })
  @IsNumber()
  @Min(1)
  age: number;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsString()
  @IsOptional()
  idProofNumber?: string;
}

export class CreateDarshanBookingDto {
  @ApiProperty({ example: '2026-10-15' })
  @IsString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty({ example: '7AM to 9AM' })
  @IsString()
  @IsNotEmpty()
  slotName: string;

  @ApiProperty({ example: 'Pankaj' })
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

  @ApiPropertyOptional({ example: 'pankaj@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({ example: '1985-05-12' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'AADHAAR' })
  @IsString()
  @IsOptional()
  idProofType?: string;

  @ApiProperty({ example: '123456789012' })
  @IsString()
  @IsNotEmpty()
  idProofNumber: string;

  @ApiPropertyOptional({ example: 'Indore, MP' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: [AttendeeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeDto)
  attendees: AttendeeDto[];
}
