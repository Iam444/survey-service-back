import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';

export type TPollOptionReadModel = IPollPlainOptionReadModel | IPollElectionsOptionReadModel;

export type TPollOptionListReadModel = IPollPlainOptionReadModel[] | IPollElectionsOptionReadModel[];

export interface IPollPlainOptionReadModel {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
}

export interface IPollElectionsOptionReadModel extends IPollPlainOptionReadModel {
    readonly candidate: IUserPreviewReadModel;
}
