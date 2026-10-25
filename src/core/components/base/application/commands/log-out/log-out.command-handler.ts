import { Injectable, Inject } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { InvalidRefreshTokenError } from '../../services/auth-service/errors/invalid-refresh-token.error.js';
import { RefreshTokenParser } from '../../services/auth-service/refresh-token-parser.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IHashService } from '$ports/services/auth/hash.service.interface.js';
import type { IAuthSessionStore } from '$ports/stores/auth-session.store.interface.js';
import type { IAuthSessionQueryHandler } from '$ports/queries/auth-session/auth-session.query-handler.js';
import type { IInvalidRefreshTokenError } from '../../services/auth-service/errors/invalid-refresh-token.error.js';

@Injectable()
export class LogOutCommandHandler {
    constructor(
        @Inject('IAuthSessionStore') private readonly _authSessionStore: IAuthSessionStore,
        @Inject('IAuthSessionQueryHandler') private readonly _authSessionQueryHandler: IAuthSessionQueryHandler,
        @Inject('IHashService') private readonly _hashService: IHashService,
    ) {}

    public handle(refreshToken?: string): AsyncResult<void, IInvalidRefreshTokenError | INotFoundError> {
        return RefreshTokenParser.parse(refreshToken).onSuccessAsync(async ({ sessionId, secret }) =>
            this._authSessionQueryHandler.handle(sessionId).onSuccessAsync(async (session) => {
                const isTokenValid = await this._hashService.compare(secret, session.tokenHash);

                if (!isTokenValid) {
                    return Result.failure(InvalidRefreshTokenError.of('Token is invalid', refreshToken));
                }

                await this._authSessionStore.delete(session.id);

                return Result.success();
            }),
        );
    }
}
