import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IUserPreviewQueryHandler } from '$ports/queries/user/user-preview.query-handler.interface.js';
import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';

@Injectable()
export class UserPreviewQueryHandler implements IUserPreviewQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(id: string): AsyncResult<IUserPreviewReadModel, INotFoundError> {
        return AsyncResult.wrap(async () => {
            const user = await this._entityManager.findOne(UserORMEntity, { id });

            if (!user) {
                return Result.failure(NotFoundError.of('User', 'id', id));
            }

            const userPreview: IUserPreviewReadModel = {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname || null,
                fullName: user.fullName,
                phone: user.phone || null,
                avatarUrl: user.avatarUrl || null,
            };

            return Result.success(userPreview);
        });
    }
}
