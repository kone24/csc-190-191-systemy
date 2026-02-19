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
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    phone!: string;

    @IsString()
    @IsNotEmpty()
    company!: string;

    @IsObject()
    @IsNotEmpty()
    address!: Record<string, unknown>;

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
    socialLinks?: Record<string, unknown>;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}