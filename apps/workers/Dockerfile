# Multi-stage Dockerfile for ShopNET Movies Background Workers
# Base image with Node 20 on Alpine Linux
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Build stage
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/workers/package.json ./apps/workers/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Worker source and build
COPY apps/workers/ ./apps/workers/
RUN pnpm --filter @shopnet/database run db:generate
RUN pnpm --filter @shopnet/workers run build

# Production Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workerjs

ENV NODE_ENV=production

COPY --from=builder --chown=workerjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=workerjs:nodejs /app/apps/workers/dist ./apps/workers/dist
COPY --from=builder --chown=workerjs:nodejs /app/apps/workers/node_modules ./apps/workers/node_modules
COPY --from=builder --chown=workerjs:nodejs /app/packages/ ./packages/
COPY --from=builder --chown=workerjs:nodejs /app/apps/workers/package.json ./apps/workers/package.json

USER workerjs

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/workers/dist/index.js"]
