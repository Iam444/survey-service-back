import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, ValidateNested, IsObject, Max } from 'class-validator';
import { UserListFiltersNestedDTO } from './user-list-filters.nested-dto.js';
import type { IUserListQuery } from '$ports/queries/user/user-list.query.interface.js';

export class KnownUserListRequestDTO implements IUserListQuery {
    @Max(100, { message: 'Максимальное значение для limit — 100' })
    @Min(1, { message: 'Минимальное значение для limit — 1' })
    @IsInt({ message: 'Параметр limit должен быть целым числом' })
    @IsOptional()
    public readonly limit: number = 20;

    @Min(0, { message: 'Минимальное значение для offset — 0' })
    @IsInt({ message: 'Параметр offset должен быть целым числом' })
    @IsOptional()
    public readonly offset: number = 0;

    @ValidateNested()
    @IsObject({ message: 'Фильтры должны быть объектом' })
    @IsOptional()
    @Type(() => UserListFiltersNestedDTO)
    public readonly filters?: UserListFiltersNestedDTO;
}
