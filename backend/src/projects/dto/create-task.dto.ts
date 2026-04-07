import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsUUID,
    IsArray,
    IsIn,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsUUID()
    @IsNotEmpty()
    project_id!: string;

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
}
