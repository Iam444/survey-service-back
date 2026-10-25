import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import type { ICheckUserExistsQueryHandler } from '$ports/queries/check-user-exists/check-user-exists.query-handler.interface.js';

@Injectable()
export class CheckUserExistsQueryHandler implements ICheckUserExistsQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(email: string): AsyncResult<boolean, never> {
        return AsyncResult.wrap(async () => {
            const user = await this._entityManager.findOne(UserORMEntity, { email });

            if (!user) {
                return Result.success(false);
            }

            return Result.success(true);
        });
    }
}
