import path from 'node:path';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
}

export default defineConfig({
    dbName: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',

    entities: ['dist/**/*.orm-entity.js'],
    entitiesTs: ['src/**/*.orm-entity.ts'],

    extensions: [Migrator],
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
    },
});
