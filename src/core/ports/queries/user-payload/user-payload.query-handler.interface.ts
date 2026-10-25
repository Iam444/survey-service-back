import { AsyncResult } from 'lang-extensions/result';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { TUserPayloadQuery } from './user-payload.query.type.js';
import type { IUserPayloadReadModel } from './user-payload.read-model.interface.js';

export interface IUserPayloadQueryHandler {
    handle(query: TUserPayloadQuery): AsyncResult<IUserPayloadReadModel, INotFoundError>;
}
