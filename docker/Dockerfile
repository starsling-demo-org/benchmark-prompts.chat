# prompts.chat Docker Image
# Multi-stage build for a production-ready Next.js application
#
# Usage with Docker Compose:
#   docker compose up -d
#
# Usage standalone (bring your own PostgreSQL):
#   docker build -f docker/Dockerfile -t prompts.chat .
#   docker run -p 4444:3000 -e DATABASE_URL="postgresql://..." prompts.chat

# ---- Stage 1: Base ----
FROM node:24-bookworm-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Stage 1b: Build-platform base ----
# The Next.js build output is platform-independent JS, so it is built once on the
# runner's native platform instead of once per target under QEMU emulation.
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Stage 2: Dependencies (target platform) ----
# Unchanged from upstream. Only its generated Prisma client (query engine for the target
# CPU) is used, by the runner stage; cached as long as the lockfile and schema do not change.
FROM base AS deps

# Copy dependency manifests and Prisma schema (postinstall runs prisma generate)
COPY package.json package-lock.json ./
COPY prisma/schema.prisma prisma/schema.prisma
COPY prisma.config.ts tsconfig.json ./

# Dummy DATABASE_URL for prisma generate (no actual connection is made)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci

# ---- Stage 2b: Dependencies (build platform, for the build only) ----
FROM build-base AS build-deps

# Copy dependency manifests and Prisma schema (postinstall runs prisma generate)
COPY package.json package-lock.json ./
COPY prisma/schema.prisma prisma/schema.prisma
COPY prisma.config.ts tsconfig.json ./

# Dummy DATABASE_URL for prisma generate (no actual connection is made)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci

# ---- Stage 3: Builder ----
FROM build-base AS builder

COPY --from=build-deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm run build

# Drop build-platform native code from the traced standalone node_modules (packages
# pinned to an os/cpu in the lockfile, the generated Prisma client, any ELF binary).
# The runner stage restores target-platform copies: the generated Prisma client from the
# deps stage, native packages from its `npm install`.
RUN rm -rf .next/standalone/node_modules/.prisma && node -e "const fs=require('fs'),p=require('path');const root='.next/standalone/node_modules';let pk=0,el=0;for(const [k,v] of Object.entries(require('./package-lock.json').packages)){if(k&&(v.cpu||v.os)){const d=p.join('.next/standalone',k);if(fs.existsSync(d)){fs.rmSync(d,{recursive:true,force:true});pk++;}}}(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);if(e.isDirectory())w(f);else if(e.isFile()){const b=Buffer.alloc(4),fd=fs.openSync(f,'r');fs.readSync(fd,b,0,4,0);fs.closeSync(fd);if(b[0]===0x7f&&b[1]===0x45&&b[2]===0x4c&&b[3]===0x46){fs.rmSync(f);el++;}}}})(root);console.log('stripped platform packages:',pk,'native files:',el)"

# ---- Stage 4: Runner ----
FROM node:24-bookworm-slim AS runner

LABEL org.opencontainers.image.source="https://github.com/f/prompts.chat"
LABEL org.opencontainers.image.description="prompts.chat - Self-hosted AI prompt library"
LABEL org.opencontainers.image.licenses="MIT"

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema, migrations, and config for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Target-platform generated Prisma client (stripped from the build-platform trace above)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Install only Prisma CLI and its dependencies for runtime migrations
# (also restores target-platform native packages stripped from the standalone trace)
RUN npm install --no-save prisma@6.19 dotenv

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

USER nextjs

ENTRYPOINT ["./entrypoint.sh"]
