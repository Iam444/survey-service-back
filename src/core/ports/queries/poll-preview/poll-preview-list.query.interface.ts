import type { IListParameters } from '$shared/queries/list-parameters.interface.js';
import type { TSortOptions } from '$shared/queries/sort-options.type.js';
import type { TFilters } from '$shared/queries/filters.type.js';
import type { IPollPreviewReadModel } from './poll-preview.read-model.interface.js';

type TSortableFields = Pick<IPollPreviewReadModel, 'name'>;
type TFilterableFields = Pick<IPollPreviewReadModel, 'format' | 'status' | 'name' | 'author'>;

export type TPollListFilters = TFilters<TFilterableFields>;
export type TPollListSortOptions = TSortOptions<TSortableFields>;

export interface IPollPreviewListQuery extends IListParameters {
    sortBy?: TPollListSortOptions;
    filters?: TPollListFilters;
}
