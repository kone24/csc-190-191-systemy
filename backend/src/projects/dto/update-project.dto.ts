import {
    IsOptional,
    IsString,
    IsNotEmpty,
    IsNumber,
    IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    service_type?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    start_date?: string;

    @IsOptional()
    @IsString()
    end_date?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value != null ? Number(value) : undefined)
    budget?: number;

    @IsOptional()
    @IsUUID()
    client_id?: string;

    @IsOptional()
    @IsUUID()
    owner_id?: string;

    @IsOptional()
    @IsUUID()
    campaign_id?: string;
}
