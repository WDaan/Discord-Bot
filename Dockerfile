FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM node:slim as production-stage
#install deps
RUN apt-get update \
    && apt-get install -y wakeonlan sshpass \
    && apt-get autoremove -y && apt-get autoclean -y \
    && rm -rf /var/lib/apt/lists/*
#install app
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY package* ./
RUN npm i --production
CMD NODE_ENV=production npm start