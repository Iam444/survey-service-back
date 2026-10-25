import { defineEntity, p } from '@mikro-orm/core';
import { PollORMEntity } from './poll.orm-entity.js';
import { PollOptionORMEntity } from './poll-option.orm-entity.js';

const PollVoteORMSchema = defineEntity({
    name: 'PollVote',
    tableName: 'poll_votes',
    properties: {
        id: p.integer().primary(),
        voterId: p.string().type('uuid').name('voter_id').index(),
        poll: () => p.manyToOne(PollORMEntity).deleteRule('cascade'),
        options: () => p.manyToMany(PollOptionORMEntity).owner(),
        createdAt: p
            .datetime()
            .type('timestamp')
            .onCreate(() => new Date())
            .name('created_at'),
    },
});

export class PollVoteORMEntity extends PollVoteORMSchema.class {}

PollVoteORMSchema.setClass(PollVoteORMEntity);

export { PollVoteORMSchema };
