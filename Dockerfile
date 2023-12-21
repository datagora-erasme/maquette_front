FROM node:lts-alpine as build
ARG VUE_APP_API_BASE_URL
ENV VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL
WORKDIR /app

COPY ./ /app/


RUN yarn install --ignore-engines
RUN yarn build



FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]