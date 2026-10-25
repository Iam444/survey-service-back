import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IUserPasswordHashQueryHandler } from '$ports/queries/user-password-hash/user-password-hash.query-handler.interface.js';

@Injectable()
export class UserPasswordHashQueryHandler implements IUserPasswordHashQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(email: string): AsyncResult<string, INotFoundError> {
        return AsyncResult.wrap(async () => {
            const ormUser = await this._entityManager.findOne(UserORMEntity, { email });

            if (!ormUser) {
                return Result.failure(NotFoundError.of('User', 'email', email));
            }

            return Result.success(ormUser.passwordHash);
        });
    }
}
