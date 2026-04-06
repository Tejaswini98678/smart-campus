# Dockerfile for Smart Campus UniPortal 4.0
# Optimized for Next.js Standalone Mode + Prisma SQLite
# Switched to Debian-slim for better native binary compatibility (Prisma/ONNX)

FROM node:20-slim AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM base AS builder
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Ensure OpenSSL and libgomp1 (for ONNX) are available in runtime
RUN apt-get update && apt-get install -y openssl ca-certificates libgomp1 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV PORT 7860
ENV NEXT_TELEMETRY_DISABLED 1
# Set HOME to a writable directory to avoid npm/npx permission issues
ENV HOME=/app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --gid 1001 --home /app nextjs

# Set up the public files and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations for runtime usage
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create a shell script to handle startup logic (migrations + start)
COPY --chown=nextjs:nodejs docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Ensure the app directory is writable by nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 7860

ENTRYPOINT ["./docker-entrypoint.sh"]
