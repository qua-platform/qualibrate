FROM docker.io/library/node:18.13.0-alpine3.16 as build
ENV NODE_ENV=production

WORKDIR /frontend
COPY package.json package-lock.json ./

RUN npm ci --only-production --ignore-scripts

ARG REACT_APP_VERSION
ENV REACT_APP_VERSION $REACT_APP_VERSION
COPY . .
RUN npm run build:inside-docker

# Nginx production
FROM docker.io/library/nginx:1.23.3-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm index.html
COPY --from=build /frontend/dist/ ./

EXPOSE 80
