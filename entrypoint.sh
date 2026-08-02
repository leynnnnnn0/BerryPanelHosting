#!/bin/sh
set -e

if [ ! -f .env ]; then
    cp .env.example .env
fi

echo "Waiting for MySQL..."
until php artisan db:show > /dev/null 2>&1; do
  sleep 2
done

php artisan key:generate --force
php artisan migrate --force
exec "$@"