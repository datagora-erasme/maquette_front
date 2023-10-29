FROM sofianehamlaoui/httpdnpm

RUN mkdir -p /var/www

RUN apt update

COPY . /var/www/front/

WORKDIR /var/www/front/

RUN yarn install --ignore-engines
RUN yarn build

RUN cp -r dist/* /usr/local/apache2/htdocs/
