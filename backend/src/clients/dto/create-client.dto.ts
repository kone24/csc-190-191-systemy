import {
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'EmailOrPhone', async: false })
export class EmailOrPhoneConstraint implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments) {
        const obj = args.object as CreateClientDto;
        return !!(obj.email || obj.phone_number);
    }

    defaultMessage() {
        return 'At least one of email or phone_number must be provided';
    }
}

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    first_name!: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsEmail()
    @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
    email?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
    phone_number?: string;

    @IsOptional()
    @IsString()
    business_name?: string;

    @Validate(EmailOrPhoneConstraint)
    _contactCheck?: unknown;

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