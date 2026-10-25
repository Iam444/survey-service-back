import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get(ConfigService);

    app.use(cookieParser());

    app.setGlobalPrefix('api');

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.set('query parser', (string: string) =>
        qs.parse(string, {
            allowDots: true,
        }),
    );

    await app.listen(configService.get<string>('PORT') || 3000);
}

await bootstrap();
