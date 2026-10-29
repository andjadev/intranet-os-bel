# OSBEL Intranet – single container (Next.js standalone + Payload).
# Data (SQLite file + uploaded images) lives in the /app/data volume.

FROM node:22.23.4-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time values only; the real ones come from the runtime environment.
RUN PAYLOAD_SECRET=build DATABASE_URL=file:/tmp/build.db npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/intranet.db \
    MEDIA_DIR=/app/data/media

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/data/media && chown -R nextjs:nodejs /app/data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
VOLUME /app/data
EXPOSE 3000

# Database migrations run automatically on start (prodMigrations in payload.config.ts).
CMD ["node", "server.js"]
