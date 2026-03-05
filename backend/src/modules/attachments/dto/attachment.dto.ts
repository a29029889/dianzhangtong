import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { AttachmentType } from '../entities/attachment.entity';

export class CreateAttachmentDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  size: number;

  @IsEnum(AttachmentType)
  @IsOptional()
  mimeType?: AttachmentType;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAttachmentDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// 筛选DTO
export class QueryAttachmentDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  mimeType?: AttachmentType;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}
