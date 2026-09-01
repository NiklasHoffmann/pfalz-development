FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Force a production-like Next.js build regardless of external env injection.
ENV NODE_ENV=production

# Environment variables must be present at build time
ARG MONGODB_URI=mongodb://localhost:27017/nextjs-starter
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_OUTPUT_STANDALONE=1
ENV MONGODB_URI=${MONGODB_URI}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_OUTPUT_STANDALONE=${NEXT_OUTPUT_STANDALONE}

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Chromium for invoice PDF rendering (puppeteer-core drives the system binary).
RUN apk add --no-cache \
	su-exec \
	chromium \
	nss \
	freetype \
	harfbuzz \
	ca-certificates \
	ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Set the correct permission for prerender cache
RUN mkdir -p .next logs
RUN chown -R nextjs:nodejs .next logs && chmod +x /usr/local/bin/docker-entrypoint.sh

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["docker-entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
