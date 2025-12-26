FROM node:25
WORKDIR /dist/server
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD [ "node", "dist/server.js" ]