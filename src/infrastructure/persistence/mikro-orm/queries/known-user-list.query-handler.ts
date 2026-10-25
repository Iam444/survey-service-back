import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { FiltersMapper } from '../mappers/filters.mapper.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';
import type { IKnownUserListQueryHandler } from '$ports/queries/user/known-user-list.query-handler.interface.js';
import type { IKnownUserListQuery } from '$ports/queries/user/known-user-list.query.interface.js';
import type { IUserListReadModel } from '$ports/queries/user/user-list.read-model.interface.js';

@Injectable()
export class KnownUserListQueryHandler implements IKnownUserListQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    /**
     * Для полноценной логики поиска "известных" пользователей нужна интеграция с основным приложением.
     * До тех пор данный QH - просто заглушка.
     */
    public handle(query: IKnownUserListQuery): AsyncResult<IUserListReadModel, never> {
        return AsyncResult.wrap(async () => {
            const where = FiltersMapper.map<UserORMEntity>(query.filters);

            where.$and = [{ id: { $ne: query.userId } }];

            const [ormUsers, totalCount] = await this._entityManager.findAndCount(UserORMEntity, where, {
                limit: query.limit,
                offset: query.offset,
            });

            const users: IUserPreviewReadModel[] = ormUsers.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname || null,
                fullName: user.fullName,
                phone: user.phone || null,
                avatarUrl: user.avatarUrl || null,
            }));

            return Result.success({ users, totalCount });
        });
    }
}
