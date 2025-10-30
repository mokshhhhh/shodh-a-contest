FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=production

RUN apk add --no-cache docker-cli
COPY . .

EXPOSE 4000
CMD ["npm", "start"]




