FROM node:20

WORKDIR /app

COPY . .

# core-api로 이동
WORKDIR /app/backend/core-api

# 설치
RUN npm install

# 빌드
RUN npm run build

# 실행
CMD ["node", "dist/main.js"]
