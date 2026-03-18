import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  loginId: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  birthDate: string; // ISO date, 스키마 필수

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressRoad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressDetail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  termsAgreedAt?: string;

  @IsOptional()
  @IsString()
  privacyAgreedAt?: string;
}
