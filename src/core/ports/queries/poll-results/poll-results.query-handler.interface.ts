import type { AsyncResult } from 'lang-extensions/result';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { IPollResultsQuery } from './poll-results.query.interface.js';
import type { IPollResultsReadModel } from './poll-results.read-model.interface.js';

export interface IPollResultsQueryHandler {
    handle(query: IPollResultsQuery): AsyncResult<IPollResultsReadModel, INotFoundError | INotPermittedError>;
}
