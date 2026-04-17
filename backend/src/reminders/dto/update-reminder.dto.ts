import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateReminderDto {
  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  interaction_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  interaction_date?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  days_after_interaction?: number;

  @IsOptional()
  @IsDateString()
  remind_at?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  sync_to_google?: boolean;

  @IsOptional()
  @IsString()
  assigned_to?: string;

  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  banner_shown?: boolean;

  @IsOptional()
  @IsBoolean()
  email_sent?: boolean;

  @IsOptional()
  @IsDateString()
  completed_at?: string;
}