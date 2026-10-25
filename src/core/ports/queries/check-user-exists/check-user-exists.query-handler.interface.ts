import { AsyncResult } from 'lang-extensions/result';

export interface ICheckUserExistsQueryHandler {
    handle(email: string): AsyncResult<boolean, never>;
}
