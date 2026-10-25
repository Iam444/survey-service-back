import { Injectable, Inject } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { UUIDGenerator } from 'lang-extensions/uuid';
import { InvalidRefreshTokenError } from '../../services/auth-service/errors/invalid-refresh-token.error.js';
import { RefreshTokenParser } from '../../services/auth-service/refresh-token-parser.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { ITokenPairDTO } from '$components/base/application/services/auth-service/dto/token-pair.dto.interface.js';
import type { IHashService } from '$ports/services/auth/hash.service.interface.js';
import type { IAuthSessionStore } from '$ports/stores/auth-session.store.interface.js';
import type { IAuthSessionQueryHandler } from '$ports/queries/auth-session/auth-session.query-handler.js';
import type { IJWTService } from '$ports/services/auth/jwt.service.interface.js';
import type { IUserPayloadQueryHandler } from '$ports/queries/user-payload/user-payload.query-handler.interface.js';
import type { IInvalidRefreshTokenError } from '../../services/auth-service/errors/invalid-refresh-token.error.js';

@Injectable()
export class RefreshSessionCommandHandler {
    constructor(
        @Inject('IAuthSessionStore') private readonly _authSessionStore: IAuthSessionStore,
        @Inject('IAuthSessionQueryHandler') private readonly _authSessionQueryHandler: IAuthSessionQueryHandler,
        @Inject('IUserPayloadQueryHandler') private readonly _userPayloadQueryHandler: IUserPayloadQueryHandler,
        @Inject('IHashService') private readonly _hashService: IHashService,
        @Inject('IJWTService') private readonly _jwtService: IJWTService,
    ) {}

    public handle(refreshToken?: string): AsyncResult<ITokenPairDTO, IInvalidRefreshTokenError | INotFoundError> {
        return RefreshTokenParser.parse(refreshToken)
            .onSuccessAsync(async (parsedToken) =>
                this._authSessionQueryHandler
                    .handle(parsedToken.sessionId)
                    .map((session) => ({ parsedToken, session })),
            )
            .onSuccessAsync(
                async ({
                    parsedToken: { secret },
                    session,
                }): Promise<Result<ITokenPairDTO, IInvalidRefreshTokenError | INotFoundError>> => {
                    if (session.expiresAt < new Date()) {
                        await this._authSessionStore.delete(session.id);

                        return Result.failure(InvalidRefreshTokenError.of('Token is expired', refreshToken));
                    }

                    const isTokenValid = await this._hashService.compare(secret, session.tokenHash);

                    if (!isTokenValid) {
                        return Result.failure(InvalidRefreshTokenError.of('Token is invalid', refreshToken));
                    }

                    return this._userPayloadQueryHandler
                        .handle({ id: session.userId })
                        .onSuccessAsync(async (payload) => {
                            const secret = UUIDGenerator.generate();

                            const tokenHash = await this._hashService.hash(secret);

                            const accessToken = this._jwtService.sign(
                                { sub: payload.id, email: payload.email },
                                { expiresIn: '15m' },
                            );

                            const refreshToken = `${session.id}.${secret}`;

                            await this._authSessionStore.save({ ...session, tokenHash });

                            const tokenPair: ITokenPairDTO = {
                                accessToken,
                                refreshToken,
                            };

                            return Result.success(tokenPair);
                        });
                },
            );
    }
}
