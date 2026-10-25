import { defineEntity, p } from '@mikro-orm/core';
import { PollORMEntity } from './poll.orm-entity.js';

const PollAccessHolderORMSchema = defineEntity({
    name: 'PollAccessHolder',
    tableName: 'poll_access_holders',
    properties: {
        poll: () => p.manyToOne(PollORMEntity).primary().deleteRule('cascade'),
        userId: p.string().type('uuid').name('user_id').primary(),
    },
});

export class PollAccessHolderORMEntity extends PollAccessHolderORMSchema.class {}

PollAccessHolderORMSchema.setClass(PollAccessHolderORMEntity);

export { PollAccessHolderORMSchema };
