import { AsyncResult } from 'lang-extensions/result';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IUserPreviewReadModel } from './user-preview.read-model.interface.js';

export interface IUserPreviewQueryHandler {
    handle(userId: string): AsyncResult<IUserPreviewReadModel, INotFoundError>;
}
