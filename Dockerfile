FROM node:14-slim

WORKDIR /app

COPY ./lib/ /app/

RUN apt update
RUN apt install ffmpeg -y
RUN apt install git -y
RUN apt install curl -y
RUN mkdir /root/.ssh
RUN ssh-keyscan -H github.com >> /root/.ssh/known_hosts
RUN chmod -R 755 /root/.ssh
RUN npm i

ENTRYPOINT ["npm", "start"]
