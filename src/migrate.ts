import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config.js';

try {
    await (async () => {
        const orm = await MikroORM.init(config);

        await orm.migrator.up();

        await orm.close(true);
    })();
} catch (error) {
    console.error('Ошибка при поднятии миграций:', error);
    throw error;
}
