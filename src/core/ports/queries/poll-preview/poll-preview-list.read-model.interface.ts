import type { IPollPreviewReadModel } from './poll-preview.read-model.interface.js';

export interface IPollPreviewListReadModel {
    readonly polls: IPollPreviewReadModel[];
    readonly totalCount: number;
}
