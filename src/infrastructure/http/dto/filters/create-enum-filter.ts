import { IsOptional, IsEnum, IsArray, IsString } from 'class-validator';
import type { TConstructor } from 'lang-extensions/types';
import type { TFilter } from '$shared/queries/filters.type.js';

export function createEnumFilter<TEnum extends object, TValue extends TEnum[keyof TEnum]>(
    enumObject: TEnum,
): TConstructor<TFilter<TValue>> {
    class EnumFilterNestedDTO implements TFilter<TValue> {
        @IsOptional()
        @IsEnum(enumObject, { message: 'Некорректный...' })
        public readonly is?: TValue;

        @IsOptional()
        @IsEnum(enumObject, { message: 'Некорректный...' })
        public readonly not?: TValue;

        @IsOptional()
        @IsEnum(enumObject, { each: true, message: 'Некорректный...' })
        @IsArray()
        public readonly in?: TValue[];

        @IsOptional()
        @IsEnum(enumObject, { each: true, message: 'Некорректный...' })
        @IsArray()
        public readonly notIn?: TValue[];

        @IsOptional()
        @IsString()
        public readonly contains?: string;
    }

    return EnumFilterNestedDTO;
}
