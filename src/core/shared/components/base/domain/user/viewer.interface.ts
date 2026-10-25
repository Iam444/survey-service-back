import type { UserID } from './user.id.js';

export interface IViewer {
    readonly isRegistered: boolean;
    readonly user: UserID;
}
