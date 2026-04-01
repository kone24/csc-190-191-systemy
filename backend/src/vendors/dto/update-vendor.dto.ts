import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class UpdateVendorDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  project_id?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  business_name?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  date_meet?: string;

  @IsString()
  @IsOptional()
  outcome?: string;

  @IsString()
  @IsOptional()
  additional_info?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
