import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@shriomkareshwar.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Omkar@2026!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
