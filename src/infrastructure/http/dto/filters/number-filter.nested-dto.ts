import { IsOptional, IsNumber, IsArray } from 'class-validator';
import type { TFilter } from '$shared/queries/filters.type.js';

export class NumberFilterNestedDTO implements TFilter<number> {
    @IsOptional()
    @IsNumber()
    public readonly is?: number;

    @IsOptional()
    @IsNumber()
    public readonly not?: number;

    @IsOptional()
    @IsNumber({}, { each: true })
    @IsArray()
    public readonly in?: number[];

    @IsOptional()
    @IsNumber({}, { each: true })
    @IsArray()
    public readonly notIn?: number[];

    @IsOptional()
    @IsNumber()
    public readonly from?: number;

    @IsOptional()
    @IsNumber()
    public readonly to?: number;
}
