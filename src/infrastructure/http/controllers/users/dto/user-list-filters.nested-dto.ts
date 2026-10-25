import { IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StringFilterNestedDTO } from '$infra/http/dto/filters/string-filter.nested-dto.js';

export class UserListFiltersNestedDTO {
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly id?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly email?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly name?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly surname?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly fullName?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => UserListFiltersNestedDTO)
    public readonly _or?: UserListFiltersNestedDTO[];
}
