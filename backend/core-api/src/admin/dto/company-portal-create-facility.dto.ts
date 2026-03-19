import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** 시설 생성 시 층(구역)별 초기 그리드 — 없으면 빈 시설만 생성 */
export class CompanyPortalFacilityFloorDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @IsInt()
  @Min(1)
  @Max(200)
  rows: number;

  @IsInt()
  @Min(1)
  @Max(200)
  cols: number;
}

export class CompanyPortalCreateFacilityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyPortalFacilityFloorDto)
  floors?: CompanyPortalFacilityFloorDto[];
}
