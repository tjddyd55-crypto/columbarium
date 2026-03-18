import { IsString, IsNotEmpty } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  @IsNotEmpty()
  unitId: string;
}
