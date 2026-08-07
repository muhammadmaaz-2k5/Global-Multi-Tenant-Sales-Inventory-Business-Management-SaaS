import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AdjustInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsUUID()
  @IsNotEmpty()
  variantId: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class TransferInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  variantId: string;

  @IsUUID()
  @IsNotEmpty()
  fromLocationId: string;

  @IsUUID()
  @IsNotEmpty()
  toLocationId: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
