FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install --save-dev ts-node nodemon typescript

COPY . .

EXPOSE 5002

CMD ["npm", "run", "dev"]
