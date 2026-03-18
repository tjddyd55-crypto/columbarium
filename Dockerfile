FROM node:20

WORKDIR /app

COPY . .

RUN cd backend/core-api && npm install
RUN cd backend/core-api && npm run build

WORKDIR /app/backend/core-api

CMD ["node", "dist/main.js"]
