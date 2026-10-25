import { AsyncResult } from 'lang-extensions/result';
import type { IUserListQuery } from './user-list.query.interface.js';
import type { IUserListReadModel } from './user-list.read-model.interface.js';

export interface IUserPreviewListQueryHandler {
    handle(query: IUserListQuery): AsyncResult<IUserListReadModel, never>;
}
