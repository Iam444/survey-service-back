import { AsyncResult } from 'lang-extensions/result';
import type { INotFoundError } from '$shared/errors/not-found.error.js';

export interface IUserPasswordHashQueryHandler {
    handle(email: string): AsyncResult<string, INotFoundError>;
}
