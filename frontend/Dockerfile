FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN rm -f package-lock.json && npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
