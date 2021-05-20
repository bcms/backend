FROM node:12-alpine

WORKDIR /app

COPY dist/. /app

RUN npm i

ENTRYPOINT ["node", "bin/bcms-backend.js", "--dev"]
