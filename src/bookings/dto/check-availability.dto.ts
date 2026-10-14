import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({ example: '2026-10-15', description: 'Date in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '7AM to 9AM', description: 'Slot name or ALL' })
  @IsString()
  @IsNotEmpty()
  slotName: string;
}
