import { AsyncResult } from 'lang-extensions/result';
import type { IKnownUserListQuery } from './known-user-list.query.interface.js';
import type { IUserListReadModel } from './user-list.read-model.interface.js';

export interface IKnownUserListQueryHandler {
    handle(query: IKnownUserListQuery): AsyncResult<IUserListReadModel, never>;
}
