FROM becomes/cms-backend-base-image

WORKDIR /app

COPY ./lib/ /app/

RUN npm i

ENTRYPOINT ["npm", "start"]
