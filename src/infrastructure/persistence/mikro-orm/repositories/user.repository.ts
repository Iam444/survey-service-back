import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import { UserMapper } from '../mappers/user.mapper.js';
import type { Email } from '$shared/value-objects/email.js';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { User } from '$components/base/domain/user/user.js';
import type { IUserRepository } from '$ports/repositories/user.repository.interface.js';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly _entityManager: EntityManager) {}

    public async save(user: User, userPasswordHash?: string): Promise<void> {
        let ormEntity = await this._entityManager.findOne(UserORMEntity, { id: user.id.value });

        if (!ormEntity) {
            ormEntity = new UserORMEntity();
            ormEntity.id = user.id.value;

            this._entityManager.persist(ormEntity);
        }

        UserMapper.mapToORM(user, ormEntity, userPasswordHash);

        await this._entityManager.flush();
    }

    public async findById(id: UserID): Promise<User | null> {
        const ormEntity = await this._entityManager.findOne(UserORMEntity, { id: id.value });

        if (!ormEntity) {
            return null;
        }

        return UserMapper.mapToDomain(ormEntity);
    }

    public async findByEmail(email: Email): Promise<User | null> {
        const ormEntity = await this._entityManager.findOne(UserORMEntity, { email: email.value });

        if (!ormEntity) {
            return null;
        }

        return UserMapper.mapToDomain(ormEntity);
    }
}
