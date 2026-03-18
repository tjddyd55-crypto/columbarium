FROM node:20-alpine AS builder

WORKDIR /app

# core-api만 복사
COPY backend/core-api ./backend/core-api

WORKDIR /app/backend/core-api

# 의존성 설치
COPY backend/core-api/package*.json ./
RUN npm ci

# 나머지 복사
COPY backend/core-api .

# 빌드
RUN npm run build

# ----------------------------

FROM node:20-alpine AS runner

WORKDIR /app

# dist 복사 (경로 중요)
COPY --from=builder /app/backend/core-api/dist ./dist
COPY --from=builder /app/backend/core-api/node_modules ./node_modules
COPY --from=builder /app/backend/core-api/package*.json ./
COPY --from=builder /app/backend/core-api/prisma ./prisma

# prisma client
RUN npx prisma generate

CMD ["node", "dist/main.js"]
