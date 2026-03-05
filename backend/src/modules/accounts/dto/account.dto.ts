import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  shopId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

export class UpdateAccountDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  shopId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
