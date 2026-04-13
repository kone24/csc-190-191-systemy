import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGanttEntryDto {
    @IsOptional()
    @IsUUID()
    client_id?: string | null;

    @IsOptional()
    @IsUUID()
    project_id?: string | null;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    assignee?: string;

    @IsString()
    @IsNotEmpty()
    color!: string;

    @IsString()
    @IsNotEmpty()
    start_date!: string;

    @IsString()
    @IsNotEmpty()
    end_date!: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value != null ? Number(value) : undefined)
    lane?: number;
}

export class UpdateGanttEntryDto {
    @IsOptional()
    @IsUUID()
    client_id?: string;

    @IsOptional()
    @IsUUID()
    project_id?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    assignee?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsString()
    start_date?: string;

    @IsOptional()
    @IsString()
    end_date?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value != null ? Number(value) : undefined)
    lane?: number;
}
