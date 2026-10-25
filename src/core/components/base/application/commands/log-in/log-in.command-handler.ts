import { Injectable, Inject } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { UUIDGenerator } from 'lang-extensions/uuid';
import { SharedErrorCodes } from '$shared/errors/shared-error-codes.js';
import { InvalidCredentialsError } from '../../services/auth-service/errors/invalid-credentials.error.js';
import type { IUserPasswordHashQueryHandler } from '$ports/queries/user-password-hash/user-password-hash.query-handler.interface.js';
import type { IHashService } from '$ports/services/auth/hash.service.interface.js';
import type { IJWTService } from '$ports/services/auth/jwt.service.interface.js';
import type { ISecretGenerator } from '$ports/services/auth/secret-generator.interface.js';
import type { IAuthSessionStore } from '$ports/stores/auth-session.store.interface.js';
import type { IUserPayloadQueryHandler } from '$ports/queries/user-payload/user-payload.query-handler.interface.js';
import type { IInvalidCredentialsError } from '../../services/auth-service/errors/invalid-credentials.error.js';
import type { ITokenPairDTO } from '../../services/auth-service/dto/token-pair.dto.interface.js';
import type { ILogInCommand } from './log-in.command.js';

@Injectable()
export class LogInCommandHandler {
    constructor(
        @Inject('IAuthSessionStore') private readonly _authSessionStore: IAuthSessionStore,
        @Inject('IUserPayloadQueryHandler') private readonly _userPayloadQueryHandler: IUserPayloadQueryHandler,
        @Inject('IUserPasswordHashQueryHandler')
        private readonly _userPasswordHashQueryHandler: IUserPasswordHashQueryHandler,
        @Inject('IHashService') private readonly _hashService: IHashService,
        @Inject('IJWTService') private readonly _jwtService: IJWTService,
        @Inject('ISecretGenerator') private readonly _secretGenerator: ISecretGenerator,
    ) {}

    public handle(command: ILogInCommand): AsyncResult<ITokenPairDTO, IInvalidCredentialsError> {
        return this._userPasswordHashQueryHandler
            .handle(command.email)
            .onSuccessAsync(async (passwordHash) => {
                const isPasswordValid = await this._hashService.compare(command.password, passwordHash);

                if (!isPasswordValid) {
                    return Result.failure(
                        InvalidCredentialsError.of(
                            `Invalid password or email. Provided email: ${command.email}`,
                            command.email,
                        ),
                    );
                }

                return Result.success();
            })
            .onSuccessAsync(async () => await this._userPayloadQueryHandler.handle({ email: command.email }))
            .onSuccessAsync(async (payload) => {
                const accessToken = this._jwtService.sign(
                    {
                        sub: payload.id,
                        email: payload.email,
                    },
                    { expiresIn: '15m' },
                );

                const tokenSecret = this._secretGenerator.generate();
                const sessionId = UUIDGenerator.generate();
                const refreshToken = `${sessionId}.${tokenSecret}`;
                const tokenHash = await this._hashService.hash(tokenSecret);
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const createdAt = new Date();

                await this._authSessionStore.save({
                    id: sessionId,
                    userId: payload.id,
                    tokenHash,
                    expiresAt,
                    createdAt,
                });

                return Result.success({ accessToken, refreshToken });
            })
            .mapError((error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    return InvalidCredentialsError.of(
                        `Invalid password or email. Provided email: ${command.email}`,
                        command.email,
                    );
                }

                return error;
            });
    }
}
