import { defineEntity, p } from '@mikro-orm/core';
import { PollOptionORMEntity } from './poll-option.orm-entity.js';
import { PollVoteORMEntity } from './poll-vote.orm-entity.js';
import { PollAccessHolderORMEntity } from './poll-access-holder.orm-entity.js';
import { PollStatisticsAccessHolderORMEntity } from './poll-statistics-access-holder.orm-entity.js';

const PollORMSchema = defineEntity({
    name: 'Poll',
    tableName: 'polls',
    properties: {
        id: p.string().primary().type('uuid'),
        authorId: p.string().type('uuid').name('author_id').index(),
        name: p.string(),
        description: p.text().strictNullable(),
        format: p.enum(['voting', 'elections'] as const),
        status: p.enum(['created', 'opened', 'closed'] as const),
        options: () => p.oneToMany(PollOptionORMEntity).mappedBy('poll').orphanRemoval().eager(),

        votes: () => p.oneToMany(PollVoteORMEntity).mappedBy('poll').orphanRemoval(),

        isMultiChoiceEnabled: p.boolean().name('multi_choice'),
        accessType: p.enum(['public', 'registered_only', 'specified_users']).name('access_type'),
        accessHolders: () => p.oneToMany(PollAccessHolderORMEntity).mappedBy('poll').orphanRemoval(),
        statisticsDisplayFormat: p.enum(['none', 'partial', 'full']).name('statistics_format'),
        statisticsAccessType: p
            .enum(['public', 'specified_users', 'private'])
            .name('statistics_access_type')
            .nullable(),
        statisticsAccessHolders: () =>
            p.oneToMany(PollStatisticsAccessHolderORMEntity).mappedBy('poll').orphanRemoval(),
        shouldShowStatisticsAfterVoting: p.boolean().name('statistics_show_after_voting').nullable(),
    },
});

export class PollORMEntity extends PollORMSchema.class {}

PollORMSchema.setClass(PollORMEntity);

export { PollORMSchema };
