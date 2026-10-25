import { EntityManager } from '@mikro-orm/postgresql';
import { Inject } from '@nestjs/common';
import { AuthSessionORMEntity } from '../orm-entities/auth-session.orm-entity.js';
import type { IAuthSessionDTO } from '$components/base/application/services/auth-service/dto/auth-session.dto.interface.js';
import type { IAuthSessionStore } from '$ports/stores/auth-session.store.interface.js';

export class AuthSessionStore implements IAuthSessionStore {
    constructor(@Inject(EntityManager) private readonly _entityManager: EntityManager) {}

    public async save(session: IAuthSessionDTO): Promise<void> {
        let ormEntity = await this._entityManager.findOne(AuthSessionORMEntity, { id: session.id });

        if (!ormEntity) {
            ormEntity = new AuthSessionORMEntity();
            ormEntity.id = session.id;
        }

        ormEntity.userId = session.userId;
        ormEntity.tokenHash = session.tokenHash;
        ormEntity.expiresAt = session.expiresAt;

        await this._entityManager.persist(ormEntity).flush();
    }

    public async delete(id: string): Promise<void> {
        const sessionOrm = this._entityManager.getReference(AuthSessionORMEntity, id);

        await this._entityManager.remove(sessionOrm).flush();
    }
}
