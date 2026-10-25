import { AsyncResult } from 'lang-extensions/result';
import type { IPollPreviewListQuery } from './poll-preview-list.query.interface.js';
import type { IPollPreviewListReadModel } from './poll-preview-list.read-model.interface.js';

export interface IPollPreviewListQueryHandler {
    handle(userId: string, query: IPollPreviewListQuery): AsyncResult<IPollPreviewListReadModel, never>;
}
