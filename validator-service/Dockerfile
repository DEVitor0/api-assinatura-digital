FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5006

CMD ["npm", "run", "start"]  # ou "dev", se estiver usando nodemon
