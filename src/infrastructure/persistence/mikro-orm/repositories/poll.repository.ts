import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { PollORMEntity } from '../orm-entities/poll.orm-entity.js';
import { PollMapper } from '../mappers/poll.mapper.js';
import type { PollID } from '$components/survey-service/domain/poll/poll.id.js';
import type { Poll } from '$components/survey-service/domain/poll/poll.js';
import type { IPollRepository } from '$ports/repositories/poll.repository.interface.js';

@Injectable()
export class PollRepository implements IPollRepository {
    constructor(private readonly _entityManager: EntityManager) {}

    public async save(poll: Poll): Promise<void> {
        let ormEntity = await this._entityManager.findOne(PollORMEntity, { id: poll.id.value });

        if (ormEntity) {
            await this._entityManager.populate(ormEntity, [
                'options',
                'votes.options',
                'accessHolders',
                'statisticsAccessHolders',
            ]);
        } else {
            ormEntity = new PollORMEntity();
            ormEntity.id = poll.id.value;

            this._entityManager.persist(ormEntity);
        }

        PollMapper.mapToORM(poll, ormEntity);

        await this._entityManager.flush();
    }

    public async findById(id: PollID): Promise<Poll | null> {
        const ormEntity = await this._entityManager.findOne(
            PollORMEntity,
            { id: id.value },
            {
                populate: ['options', 'votes.options', 'accessHolders', 'statisticsAccessHolders'],
            },
        );

        if (!ormEntity) {
            return null;
        }

        return PollMapper.mapToDomain(ormEntity);
    }
}
