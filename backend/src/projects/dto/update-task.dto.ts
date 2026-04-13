import {
    IsOptional,
    IsString,
    IsNotEmpty,
    IsNumber,
    IsUUID,
    IsArray,
    IsIn,
} from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    priority?: number;

    @IsOptional()
    @IsString()
    @IsIn(['todo', 'in_progress', 'review', 'done'])
    status?: string;

    @IsOptional()
    @IsString()
    due_date?: string;

    @IsOptional()
    @IsUUID()
    assigned_to?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    assignees?: string[];

    @IsOptional()
    @IsUUID()
    phase_id?: string;
}
