import { Injectable, Inject } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { UUIDGenerator } from 'lang-extensions/uuid';
import { Email } from '$shared/value-objects/email.js';
import { UserName } from '$components/base/domain/user/user-name.js';
import { User } from '$components/base/domain/user/user.js';
import { InvalidCredentialsError } from '../../services/auth-service/errors/invalid-credentials.error.js';
import type { ITokenPairDTO } from '$components/base/application/services/auth-service/dto/token-pair.dto.interface.js';
import type { IHashService } from '$ports/services/auth/hash.service.interface.js';
import type { ICheckUserExistsQueryHandler } from '$ports/queries/check-user-exists/check-user-exists.query-handler.interface.js';
import type { IUserRepository } from '$ports/repositories/user.repository.interface.js';
import type { IJWTService } from '$ports/services/auth/jwt.service.interface.js';
import type { ISecretGenerator } from '$ports/services/auth/secret-generator.interface.js';
import type { IAuthSessionStore } from '$ports/stores/auth-session.store.interface.js';
import type { IInvalidCredentialsError } from '../../services/auth-service/errors/invalid-credentials.error.js';
import type { ISignUpCommand } from './sign-up.command.interface.js';

@Injectable()
export class SignUpCommandHandler {
    constructor(
        @Inject('IAuthSessionStore') private readonly _authSessionStore: IAuthSessionStore,
        @Inject('IUserRepository') private readonly _userRepository: IUserRepository,
        @Inject('ICheckUserExistsQueryHandler')
        private readonly _checkUserExistsQueryHandler: ICheckUserExistsQueryHandler,
        @Inject('IHashService') private readonly _hashService: IHashService,
        @Inject('IJWTService') private readonly _jwtService: IJWTService,
        @Inject('ISecretGenerator') private readonly _secretGenerator: ISecretGenerator,
    ) {}

    public handle(command: ISignUpCommand): AsyncResult<ITokenPairDTO, IInvalidCredentialsError> {
        const email = Email.of(command.email);
        const name = UserName.of(command.name);
        const surname = command.surname ? UserName.of(command.surname) : null;

        return this._checkUserExistsQueryHandler
            .handle(command.email)
            .onSuccess((isRegistered) => {
                if (isRegistered) {
                    return Result.failure(
                        InvalidCredentialsError.of(
                            `User with provided email is already exists. Provided email: ${command.email}`,
                            command.email,
                        ),
                    );
                }

                return User.create({ email, name, surname });
            })
            .onSuccessAsync(async (user) => {
                const passwordHash = await this._hashService.hash(command.password);

                await this._userRepository.save(user, passwordHash);

                const accessToken = this._jwtService.sign(
                    {
                        sub: user.id.value,
                        email: user.email.value,
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
                    userId: user.id.value,
                    tokenHash,
                    expiresAt,
                    createdAt,
                });

                return Result.success({ accessToken, refreshToken });
            });
    }
}
