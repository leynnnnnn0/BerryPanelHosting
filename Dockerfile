FROM php:8.4-cli
WORKDIR /app

RUN apt-get update && apt-get install -y \
    unzip git curl libxml2-dev libzip-dev libonig-dev default-mysql-client \
    && docker-php-ext-install xml mbstring zip pdo_mysql \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

RUN curl -fsSL https://get.docker.com | sh

RUN curl -sSL https://nixpacks.com/install.sh | bash

COPY . .

RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]