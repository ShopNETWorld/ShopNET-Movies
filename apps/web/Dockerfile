# Multi-stage Dockerfile for ShopNET Movies Web Application
# Base image with Node 20 on Alpine Linux
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Build stage
FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Web source and build
COPY apps/web/ ./apps/web/
RUN pnpm --filter @shopnet/web run build

# Production Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/ ./packages/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "./apps/web/node_modules/next/dist/bin/next", "start", "apps/web", "-p", "3000"]
