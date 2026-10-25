import { IsInt, Min, IsOptional, IsEnum, ValidateNested, IsObject, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrdersEnum } from '$shared/queries/sort-options.type.js';
import { PollStatusesEnum } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import { StringFilterNestedDTO } from '$infra/http/dto/filters/string-filter.nested-dto.js';
import { createEnumFilter } from '$infra/http/dto/filters/create-enum-filter.js';
import type { TSortOrder } from '$shared/queries/sort-options.type.js';
import type { IPollPreviewListQuery } from '$ports/queries/poll-preview/poll-preview-list.query.interface.js';

class PollFormatEnumFilterNestedDTO extends createEnumFilter(PollFormatsEnum) {}
class PollStatusEnumFilterNestedDTO extends createEnumFilter(PollStatusesEnum) {}

class PollPreviewListFiltersNestedDTO {
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly name?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => StringFilterNestedDTO)
    public readonly authorId?: StringFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => PollFormatEnumFilterNestedDTO)
    public readonly format?: PollFormatEnumFilterNestedDTO;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => PollStatusEnumFilterNestedDTO)
    public readonly status?: PollStatusEnumFilterNestedDTO;

    @Type(() => PollPreviewListFiltersNestedDTO)
    public readonly _or?: PollPreviewListFiltersNestedDTO[];
}

class PollPreviewListSortOptionsDTO {
    @IsEnum(SortOrdersEnum, { message: 'Некорректное значение направления сортировки для названия' })
    @IsOptional()
    readonly name?: TSortOrder;
}

export class PollPreviewListRequestDTO implements IPollPreviewListQuery {
    @Max(100, { message: '' })
    @Min(1, { message: 'Минимальное значение для limit — 1' })
    @IsInt({ message: 'Параметр limit должен быть целым числом' })
    @IsOptional()
    @Type(() => Number)
    public readonly limit: number = 20;

    @Min(0, { message: 'Минимальное значение для offset — 0' })
    @IsInt({ message: 'Параметр offset должен быть целым числом' })
    @IsOptional()
    @Type(() => Number)
    public readonly offset: number = 0;

    @ValidateNested()
    @IsObject({ message: 'Блок фильтров должен быть объектом' })
    @IsOptional()
    @Type(() => PollPreviewListFiltersNestedDTO)
    readonly filters?: PollPreviewListFiltersNestedDTO;

    @ValidateNested()
    @IsObject({ message: 'Блок сортировки должен быть объектом' })
    @IsOptional()
    @Type(() => PollPreviewListSortOptionsDTO)
    readonly sortBy?: PollPreviewListSortOptionsDTO;
}
