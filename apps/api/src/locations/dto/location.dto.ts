import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum LocationType {
  STORE = 'STORE',
  WAREHOUSE = 'WAREHOUSE',
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
