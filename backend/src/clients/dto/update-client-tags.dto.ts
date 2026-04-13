import {
    ArrayMaxSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEmail,
    IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClientTagsDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    first_name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    last_name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    business_name?: string;

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
    @IsString()
    additional_info?: string;

    @IsOptional()
    @IsObject()
    address?: Record<string, unknown>;

    @IsOptional()
    @IsObject()
    social_links?: Record<string, unknown>;

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
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @ArrayMaxSize(3)
    tags?: string[];
}
