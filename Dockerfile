FROM node:8.9-alpine

COPY . /var/app

RUN npm install pm2 -g

WORKDIR /var/app

RUN npm install

ENTRYPOINT  ["pm2", "start", "-x", "app.js", "--name=recursivecall", "--no-daemon", "--watch"]

