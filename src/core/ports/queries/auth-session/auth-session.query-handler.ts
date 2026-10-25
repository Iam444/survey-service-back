import { AsyncResult } from 'lang-extensions/result';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IAuthSessionDTO } from '$components/base/application/services/auth-service/dto/auth-session.dto.interface.js';

export interface IAuthSessionQueryHandler {
    handle(sessionId: string): AsyncResult<IAuthSessionDTO, INotFoundError>;
}
