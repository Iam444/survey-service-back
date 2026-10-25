import { defineEntity, p } from '@mikro-orm/core';

const UserORMSchema = defineEntity({
    name: 'User',
    tableName: 'users',
    properties: {
        id: p.string().primary().type('uuid'),
        email: p.string().unique(),
        passwordHash: p.string().name('password_hash'),
        name: p.string(),
        surname: p.string().strictNullable(),
        fullName: p
            .string()
            .name('full_name')
            .index()
            .onCreate((user) => (user.surname ? `${user.name} ${user.surname}` : user.name))
            .onUpdate((user) => (user.surname ? `${user.name} ${user.surname}` : user.name)),
        phone: p.string().strictNullable(),
        avatarUrl: p.string().strictNullable(),
    },
});

export class UserORMEntity extends UserORMSchema.class {}

UserORMSchema.setClass(UserORMEntity);

export { UserORMSchema };
