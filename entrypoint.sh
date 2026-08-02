#!/bin/sh
if [ ! -f .env ]; then
    cp .env.example .env
fi
touch database/database.sqlite
php artisan key:generate --force
php artisan migrate --force
exec "$@"
