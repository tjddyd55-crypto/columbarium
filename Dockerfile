FROM node:20

WORKDIR /app

COPY backend/core-api ./backend/core-api

WORKDIR /app/backend/core-api

RUN npm install
RUN npm run build

CMD ["node", "dist/main.js"]
