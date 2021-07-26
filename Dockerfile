FROM node:14-slim

WORKDIR /app

COPY . /app

RUN apt update
RUN apt install ffmpeg -y
RUN npm i

ENTRYPOINT ["npm", "run", "dev"]
