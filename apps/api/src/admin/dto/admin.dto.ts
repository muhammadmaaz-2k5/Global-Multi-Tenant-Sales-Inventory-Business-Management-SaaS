import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ProvisionTenantDto {
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(6)
  ownerPassword!: string;

  @IsString()
  @IsNotEmpty()
  ownerFirstName!: string;

  @IsString()
  @IsNotEmpty()
  ownerLastName!: string;
}
