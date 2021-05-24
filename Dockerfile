FROM node:12-alpine

WORKDIR /app

COPY . /app

RUN npm i

ENTRYPOINT ["npm", "run", "dev"]
