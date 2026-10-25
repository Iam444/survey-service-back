import { defineEntity, p } from '@mikro-orm/core';

const AuthSessionORMSchema = defineEntity({
    name: 'AuthSession',
    tableName: 'auth_sessions',
    properties: {
        id: p.string().primary().type('uuid'),
        userId: p.string().type('uuid').name('user_id').index(),
        tokenHash: p.string().name('token_hash'),
        expiresAt: p.datetime().name('expires_at'),
        createdAt: p
            .datetime()
            .name('created_at')
            .onCreate(() => new Date()),
    },
});

export class AuthSessionORMEntity extends AuthSessionORMSchema.class {}

AuthSessionORMSchema.setClass(AuthSessionORMEntity);

export { AuthSessionORMSchema };
