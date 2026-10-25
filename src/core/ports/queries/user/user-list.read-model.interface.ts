import type { IUserPreviewReadModel } from './user-preview.read-model.interface.js';

export interface IUserListReadModel {
    readonly users: IUserPreviewReadModel[];
    readonly totalCount: number;
}
