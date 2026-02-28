import {
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsObject,
    IsOptional,
    isString,
    IsString,
} from 'class-validator';

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
    @IsString()
    date_of_contact?: string;

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
}