FROM node:20-slim AS builder

WORKDIR /app/backend/core-api

# 의존성 캐시를 위해 package/prisma 먼저 복사
COPY backend/core-api/package*.json ./
COPY backend/core-api/prisma ./prisma
RUN npm ci

# 소스 복사 후 빌드
COPY backend/core-api ./
RUN npm run build

# ----------------------------

FROM node:20-slim AS runner

WORKDIR /app/backend/core-api
ENV NODE_ENV=production

# 런타임에 필요한 파일만 복사
COPY --from=builder /app/backend/core-api/package*.json ./
COPY --from=builder /app/backend/core-api/node_modules ./node_modules
COPY --from=builder /app/backend/core-api/dist ./dist
COPY --from=builder /app/backend/core-api/prisma ./prisma

# Prisma 엔진/클라이언트 보장
RUN npx prisma generate

CMD ["node", "dist/src/main.js"]
