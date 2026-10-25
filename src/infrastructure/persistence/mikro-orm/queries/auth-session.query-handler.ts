import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Result, AsyncResult } from 'lang-extensions/result';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { AuthSessionORMEntity } from '../orm-entities/auth-session.orm-entity.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IAuthSessionDTO } from '$components/base/application/services/auth-service/dto/auth-session.dto.interface.js';
import type { IAuthSessionQueryHandler } from '$ports/queries/auth-session/auth-session.query-handler.js';

@Injectable()
export class AuthSessionQueryHandler implements IAuthSessionQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(sessionId: string): AsyncResult<IAuthSessionDTO, INotFoundError> {
        return AsyncResult.wrap(async () => {
            const session = await this._entityManager.findOne(AuthSessionORMEntity, { id: sessionId });

            if (!session) {
                return Result.failure(NotFoundError.of('Session', 'id', sessionId));
            }

            const authSessionDto: IAuthSessionDTO = {
                id: session.id,
                userId: session.userId,
                tokenHash: session.tokenHash,
                expiresAt: session.expiresAt,
                createdAt: session.createdAt,
            };

            return Result.success(authSessionDto);
        });
    }
}
