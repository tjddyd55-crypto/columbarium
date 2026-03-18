import { IsString } from 'class-validator';

export class UnregisterDeviceDto {
  @IsString()
  pushToken: string;
}
