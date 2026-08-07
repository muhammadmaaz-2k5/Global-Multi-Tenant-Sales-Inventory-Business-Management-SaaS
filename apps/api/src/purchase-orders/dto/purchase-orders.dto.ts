import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';

export class PurchaseOrderItemDto {
  @IsUUID()
  variantId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId: string;

  @IsUUID()
  locationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}
