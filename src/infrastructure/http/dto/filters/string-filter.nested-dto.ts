import { IsOptional, IsString, IsArray } from 'class-validator';
import type { TFilter } from '$shared/queries/filters.type.js';

export class StringFilterNestedDTO implements TFilter<string> {
    @IsOptional()
    @IsString()
    public readonly is?: string;

    @IsOptional()
    @IsString()
    public readonly not?: string;

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    public readonly in?: string[];

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    public readonly notIn?: string[];

    @IsOptional()
    @IsString()
    public readonly contains?: string;
}
