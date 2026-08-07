import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @IsUUID()
  variantId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discount?: number;
}

export class CheckoutDto {
  @IsUUID()
  locationId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsUUID()
  @IsOptional()
  posCartId?: string; // If this sale came from a suspended cart, we delete it
}
