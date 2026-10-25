import type { IListParameters } from '$shared/queries/list-parameters.interface.js';
import type { TFilters } from '$shared/queries/filters.type.js';
import type { IUserPreviewReadModel } from './user-preview.read-model.interface.js';

type TFilterableFields = Pick<IUserPreviewReadModel, 'id' | 'email' | 'name' | 'surname' | 'fullName'>;

export type TUserListFilters = TFilters<TFilterableFields>;

export interface IUserListQuery extends IListParameters {
    readonly filters?: TUserListFilters;
}
