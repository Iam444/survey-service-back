import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PollModule } from './infrastructure/modules/poll.module.js';
import { AuthModule } from './infrastructure/modules/auth.module.js';
import { UserModule } from './infrastructure/modules/user.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.development',
            ignoreEnvFile: process.env.NODE_ENV === 'production',
        }),
        MikroOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            driver: PostgreSqlDriver,
            useFactory: (configService: ConfigService) => ({
                driver: PostgreSqlDriver,
                dbName: configService.getOrThrow<string>('DB_NAME'),
                host: configService.getOrThrow<string>('DB_HOST'),
                port: configService.getOrThrow<number>('DB_PORT'),
                user: configService.getOrThrow<string>('DB_USER'),
                password: configService.getOrThrow<string>('DB_PASSWORD'),
                entities: ['dist/**/*.orm-entity.js'],
                entitiesTs: ['src/**/*.orm-entity.ts'],
                extensions: [Migrator],
                migrations: {
                    path: 'dist/migrations',
                    pathTs: 'src/migrations',
                    glob: '!(*.d).{js,ts}',
                    transactional: true,
                },
            }),
        }),
        AuthModule,
        UserModule,
        PollModule,
    ],
})
export class AppModule {}
