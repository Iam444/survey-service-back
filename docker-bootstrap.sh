#!/bin/sh

set -e

echo "[Bootstrap] Запуск миграций..."
node dist/migrate.js

echo "[Bootstrap] Миграции успешно применены. Запуск NestJS..."
exec node dist/main.js
