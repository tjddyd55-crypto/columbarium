import { IsString, MaxLength, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  userId: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
