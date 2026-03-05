import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { AccountType } from '../entities/account.entity';
import { Type } from 'class-transformer';

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

// 筛选DTO
export class QueryAccountDto {
  @IsOptional()
  @IsString()
  type?: AccountType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// 分页响应DTO
export class PaginatedAccountDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
