import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { AsyncResult, Result } from 'lang-extensions/result';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IUserPayloadQueryHandler } from '$ports/queries/user-payload/user-payload.query-handler.interface.js';
import type { TUserPayloadQuery } from '$ports/queries/user-payload/user-payload.query.type.js';
import type { IUserPayloadReadModel } from '$ports/queries/user-payload/user-payload.read-model.interface.js';

@Injectable()
export class UserPayloadQueryHandler implements IUserPayloadQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(query: TUserPayloadQuery): AsyncResult<IUserPayloadReadModel, INotFoundError> {
        return AsyncResult.wrap(async () => {
            const user = await this._entityManager.findOne(UserORMEntity, query);

            if (!user) {
                return Result.failure(
                    NotFoundError.of(
                        'User',
                        'email' in query ? 'email' : 'id',
                        'email' in query ? query.email : query.id,
                    ),
                );
            }

            const userCredentials: IUserPayloadReadModel = {
                id: user.id,
                email: user.email,
            };

            return Result.success(userCredentials);
        });
    }
}
