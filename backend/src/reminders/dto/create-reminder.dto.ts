import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsEmail,
} from 'class-validator';

export class CreateReminderDto {
  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  interaction_id?: string;

  @IsString()
  title!: string;

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
  @IsEmail()
  assigned_to?: string;

  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @IsOptional()
  @IsBoolean()
  send_email?: boolean;
}