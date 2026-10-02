# Multi-stage Dockerfile for ShopNET Movies API Gateway
# Base image with Node 20 on Alpine Linux
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Build stage
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy API source and build configs
COPY apps/api/ ./apps/api/

# Generate Prisma Client and build
RUN pnpm --filter @shopnet/database run db:generate
RUN pnpm --filter @shopnet/api run build

# Production Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/ ./packages/
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health/liveness || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/api/dist/main.js"]
