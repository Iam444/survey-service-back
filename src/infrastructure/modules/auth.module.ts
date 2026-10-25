import { randomBytes } from 'node:crypto';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LogInCommandHandler } from '$components/base/application/commands/log-in/log-in.command-handler.js';
import { SignUpCommandHandler } from '$components/base/application/commands/sign-up/sign-up.command-handler.js';
import { LogOutCommandHandler } from '$components/base/application/commands/log-out/log-out.command-handler.js';
import { RefreshSessionCommandHandler } from '$components/base/application/commands/refresh-session/refresh-session.command-handler.js';
import { AuthSessionORMSchema } from '$infra/persistence/mikro-orm/orm-entities/auth-session.orm-entity.js';
import { AuthSessionStore } from '$infra/persistence/mikro-orm/repositories/auth-session.store.js';
import { AuthController } from '$infra/http/controllers/auth/auth.controller.js';
import { JWTStrategy } from '$infra/http/middleware/strategies/jwt-strategy.js';
import { AuthSessionQueryHandler } from '$infra/persistence/mikro-orm/queries/auth-session.query-handler.js';
import { UserModule } from './user.module.js';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
        }),
        forwardRef(() => UserModule),
        MikroOrmModule.forFeature([AuthSessionORMSchema]),
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: 'IHashService',
            useFactory: () => ({
                hash: (data: string) => bcrypt.hash(data, 10),
                compare: (data: string, encrypted: string) => bcrypt.compare(data, encrypted),
            }),
        },
        { provide: 'ISecretGenerator', useFactory: () => ({ generate: () => randomBytes(32).toString('hex') }) },
        { provide: 'IJWTService', useExisting: JwtService },
        { provide: 'IAuthSessionStore', useClass: AuthSessionStore },
        { provide: 'IAuthSessionQueryHandler', useClass: AuthSessionQueryHandler },
        JWTStrategy,
        LogInCommandHandler,
        SignUpCommandHandler,
        LogOutCommandHandler,
        RefreshSessionCommandHandler,
    ],
    exports: [PassportModule],
})
export class AuthModule {}
