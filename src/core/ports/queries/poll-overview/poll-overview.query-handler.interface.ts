import { AsyncResult } from 'lang-extensions/result';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { TPollOverviewReadModel } from './poll-overview.read-model.interface.js';
import type { IPollOverviewQuery } from './poll-overview.query.interface.js';

export interface IPollOverviewQueryHandler {
    handle(query: IPollOverviewQuery): AsyncResult<TPollOverviewReadModel, INotFoundError | INotPermittedError>;
}
