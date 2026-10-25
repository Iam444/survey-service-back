FROM node:22-alpine AS build
WORKDIR /app

COPY lib/lang-extensions/package.json lib/lang-extensions/yarn.lock ./lib/lang-extensions/
RUN cd lib/lang-extensions && yarn install --frozen-lockfile

COPY lib/lang-extensions/tsconfig.json ./lib/lang-extensions/
COPY lib/lang-extensions/src ./lib/lang-extensions/src
RUN cd lib/lang-extensions && yarn build


COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json nest-cli.json .swcrc ./
COPY src ./src
RUN yarn build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY lib/lang-extensions/package.json lib/lang-extensions/yarn.lock ./lib/lang-extensions/
RUN cd lib/lang-extensions && yarn install --frozen-lockfile --production

COPY --from=build /app/lib/lang-extensions/dist ./lib/lang-extensions/dist

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=build /app/dist ./dist

COPY docker-bootstrap.sh ./
RUN chmod +x docker-bootstrap.sh

EXPOSE 3000

ENTRYPOINT ["./docker-bootstrap.sh"]
