import { defineEntity, p } from '@mikro-orm/core';
import { PollORMEntity } from './poll.orm-entity.js';

const PollStatisticsAccessHolderORMSchema = defineEntity({
    name: 'PollStatisticsAccessHolder',
    tableName: 'poll_statistics_access_holders',
    properties: {
        poll: () => p.manyToOne(PollORMEntity).primary().deleteRule('cascade'),
        userId: p.string().type('uuid').name('user_id').primary(),
    },
});

export class PollStatisticsAccessHolderORMEntity extends PollStatisticsAccessHolderORMSchema.class {}

PollStatisticsAccessHolderORMSchema.setClass(PollStatisticsAccessHolderORMEntity);

export { PollStatisticsAccessHolderORMSchema };
