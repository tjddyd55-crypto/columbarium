# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma 엔진/클라이언트 보장
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
