import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: '500g' })
  @IsString()
  @IsNotEmpty()
  weight: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'Anand Kumar' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({ example: 'anand@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Flat 204, Shanti Enclave' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'MG Road' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Near City Hospital' })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({ example: 'Indore' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Madhya Pradesh' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '452001' })
  @IsString()
  @IsNotEmpty()
  pinCode: string;
}
