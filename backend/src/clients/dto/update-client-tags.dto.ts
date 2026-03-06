import {
    ArrayMaxSize,
    IsArray,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class UpdateClientTagsDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @ArrayMaxSize(3)
    tags!: string[];
}
