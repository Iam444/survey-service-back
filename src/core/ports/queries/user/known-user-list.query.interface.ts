import type { IUserListQuery } from './user-list.query.interface.js';

export interface IKnownUserListQuery extends IUserListQuery {
    readonly userId: string;
}
