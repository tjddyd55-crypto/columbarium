import { IsString, IsNotEmpty } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsString()
  @IsNotEmpty()
  queueEntryId: string;
}
