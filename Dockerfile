FROM node:14-slim

WORKDIR /app

COPY ./lib/ /app/

RUN apt update
RUN apt install ffmpeg -y
RUN apt install git -y
RUN npm i

ENTRYPOINT ["npm", "start"]
