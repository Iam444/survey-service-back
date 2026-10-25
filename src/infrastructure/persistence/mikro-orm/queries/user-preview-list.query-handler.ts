import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AsyncResult, Result } from 'lang-extensions/result';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import { FiltersMapper } from '../mappers/filters.mapper.js';
import type { IUserPreviewListQueryHandler } from '$ports/queries/user/user-preview-list.query-handler.interface.js';
import type { IUserListQuery } from '$ports/queries/user/user-list.query.interface.js';
import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';
import type { IUserListReadModel } from '$ports/queries/user/user-list.read-model.interface.js';

@Injectable()
export class UserPreviewListQueryHandler implements IUserPreviewListQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(query: IUserListQuery): AsyncResult<IUserListReadModel, never> {
        return AsyncResult.wrap(async () => {
            const [ormUsers, totalCount] = await this._entityManager.findAndCount(
                UserORMEntity,
                FiltersMapper.map<UserORMEntity>(query.filters),
                {
                    limit: query.limit,
                    offset: query.offset,
                },
            );

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
