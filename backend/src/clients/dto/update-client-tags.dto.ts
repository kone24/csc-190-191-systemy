import {
    ArrayMaxSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEmail,
    IsObject,
} from 'class-validator';

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
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @ArrayMaxSize(3)
    tags?: string[];
}
