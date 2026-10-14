import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TicketReprintDto {
  @ApiProperty({ example: 'OMK-DRS-20261011-8492' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;
}

export class FindBookingDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsString()
  @IsOptional()
  aadhar?: string;
}
