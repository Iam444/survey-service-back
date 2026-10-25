import { defineEntity, p } from '@mikro-orm/core';
import { PollVoteORMEntity } from './poll-vote.orm-entity.js';
import { PollORMEntity } from './poll.orm-entity.js';

const PollOptionORMSchema = defineEntity({
    name: 'PollOption',
    tableName: 'poll_options',
    properties: {
        id: p.integer().primary(),
        name: p.string(),
        description: p.string().strictNullable(),
        candidateId: p.string().type('uuid').name('candidate_id').index().nullable(),
        poll: () => p.manyToOne(PollORMEntity).deleteRule('cascade'),
        votes: () => p.manyToMany(PollVoteORMEntity),
    },
});

export class PollOptionORMEntity extends PollOptionORMSchema.class {}

PollOptionORMSchema.setClass(PollOptionORMEntity);

export { PollOptionORMSchema };
