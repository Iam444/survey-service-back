import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserORMSchema } from '$infra/persistence/mikro-orm/orm-entities/user.orm-entity.js';
import { UserRepository } from '$infra/persistence/mikro-orm/repositories/user.repository.js';
import { UserController } from '$infra/http/controllers/users/user.controller.js';
import { UserPasswordHashQueryHandler } from '$infra/persistence/mikro-orm/queries/user-password-hash.query-handler.js';
import { UserPayloadQueryHandler } from '$infra/persistence/mikro-orm/queries/user-payload.query-handler.js';
import { CheckUserExistsQueryHandler } from '$infra/persistence/mikro-orm/queries/check-user-exists.query-handler.js';
import { UserPreviewQueryHandler } from '$infra/persistence/mikro-orm/queries/user-preview.query-handler.js';
import { UserPreviewListQueryHandler } from '$infra/persistence/mikro-orm/queries/user-preview-list.query-handler.js';
import { KnownUserListQueryHandler } from '$infra/persistence/mikro-orm/queries/known-user-list.query-handler.js';
import { AuthModule } from './auth.module.js';

@Module({
    imports: [MikroOrmModule.forFeature([UserORMSchema]), forwardRef(() => AuthModule)],
    controllers: [UserController],
    providers: [
        { provide: 'IUserRepository', useClass: UserRepository },
        { provide: 'ICheckUserExistsQueryHandler', useClass: CheckUserExistsQueryHandler },
        { provide: 'IUserPasswordHashQueryHandler', useClass: UserPasswordHashQueryHandler },
        { provide: 'IUserPayloadQueryHandler', useClass: UserPayloadQueryHandler },
        { provide: 'IUserPreviewQueryHandler', useClass: UserPreviewQueryHandler },
        { provide: 'IUserPreviewListQueryHandler', useClass: UserPreviewListQueryHandler },
        { provide: 'IKnownUserListQueryHandler', useClass: KnownUserListQueryHandler },
    ],
    exports: [
        'IUserRepository',
        'ICheckUserExistsQueryHandler',
        'IUserPasswordHashQueryHandler',
        'IUserPayloadQueryHandler',
        'IUserPreviewQueryHandler',
        'IKnownUserListQueryHandler',
    ],
})
export class UserModule {}
