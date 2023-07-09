FROM node:18

WORKDIR /app

COPY package*.json ./

#Similar to npm install but more efficient and ignoring dev dependencies
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD [ "node", "app.js" ]