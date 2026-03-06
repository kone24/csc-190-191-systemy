import {
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    first_name!: string;

    @IsString()
    @IsNotEmpty()
    last_name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    phone_number!: string;

    @IsString()
    @IsNotEmpty()
    business_name!: string;

    @IsObject()
    @IsOptional()
    address?: Record<string, unknown>;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    industry?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsObject()
    social_links?: Record<string, unknown>;

    @IsOptional()
    @IsString()
    additional_info?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    relationship_owner?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    contact_medium?: string;

    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    date_of_contact?: Date;

    @IsOptional()
    @IsString()
    where_met?: string;

    @IsOptional()
    @IsString()
    chat_summary?: string;

    @IsOptional()
    @IsString()
    outcome?: string;

    @IsOptional()
    @IsString()
    relationship_status?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    services_needed?: string[];

    @IsOptional()
    @IsString()
    project_timeline?: string;

    @IsOptional()
    @IsString()
    budget_range?: string;

    @IsOptional()
    @IsString()
    preferred_contact_method?: string;
}