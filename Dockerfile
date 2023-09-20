FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install -y curl wget && \
    apt-get clean

RUN apt-get install -y openjdk-11-jdk

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["node", "app.js"]