import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { AsyncResult, Result } from 'lang-extensions/result';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { PollORMEntity } from '../orm-entities/poll.orm-entity.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import { FiltersMapper } from '../mappers/filters.mapper.js';
import type { IPollPreviewReadModel } from '$ports/queries/poll-preview/poll-preview.read-model.interface.js';
import type { IPollPreviewListQueryHandler } from '$ports/queries/poll-preview/poll-preview-list.query-handler.interface.js';
import type { IPollPreviewListQuery } from '$ports/queries/poll-preview/poll-preview-list.query.interface.js';
import type { IPollPreviewListReadModel } from '$ports/queries/poll-preview/poll-preview-list.read-model.interface.js';

@Injectable()
export class PollPreviewListQueryHandler implements IPollPreviewListQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(userId: string, query: IPollPreviewListQuery): AsyncResult<IPollPreviewListReadModel, never> {
        return AsyncResult.wrap(async () => {
            const where = FiltersMapper.map<PollORMEntity>(query.filters);
            const [ormPolls, totalCount] = await this._entityManager.findAndCount(
                PollORMEntity,
                {
                    ...where,
                    $or: [
                        ...(where.authorId ? [] : [{ authorId: { $eq: userId } }]),
                        { votes: { voterId: userId } },
                        { status: { $ne: 'created' }, accessType: 'specified_users', accessHolders: { userId } },
                    ],
                },
                {
                    limit: query.limit,
                    offset: query.offset,
                    orderBy: query.sortBy || {},
                },
            );

            const authorIdSet = new Set<string>();

            for (const poll of ormPolls) {
                authorIdSet.add(poll.authorId);
            }

            const users = await this._entityManager
                .createQueryBuilder(UserORMEntity, 'u')
                .select(['u.id', 'u.email', 'u.name', 'u.surname', 'u.fullName', 'u.phone', 'u.avatarUrl'])
                .where({ id: { $in: [...authorIdSet] } })
                .getResult();

            const userMap = new Map(users.map((user) => [user.id, user]));

            const polls: IPollPreviewReadModel[] = ormPolls.map((pollPreview) => {
                const author = userMap.get(pollPreview.authorId);

                if (!author) {
                    throw new CorruptedInvariantException('Map value lost. "author" is not defined', {
                        map: userMap,
                        key: pollPreview.authorId,
                    });
                }

                return {
                    id: pollPreview.id,
                    format: pollPreview.format,
                    status: pollPreview.status,
                    name: pollPreview.name,
                    description: pollPreview.description ?? null,
                    author,
                };
            });

            return Result.success({ polls, totalCount });
        });
    }
}
