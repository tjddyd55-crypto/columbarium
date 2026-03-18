import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class RequestResaleDto {
  @IsString()
  @IsNotEmpty()
  contractId: string;

  @IsNumber()
  @Min(0)
  price: number;
}
