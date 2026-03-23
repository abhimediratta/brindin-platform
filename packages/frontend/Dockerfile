# Stage 1: Install dependencies
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM base AS build
COPY packages/shared/ ./packages/shared/
COPY packages/frontend/ ./packages/frontend/
COPY tsconfig.json ./

ENV NEXT_PUBLIC_API_URL=__NEXT_PUBLIC_API_URL_PLACEHOLDER__
RUN pnpm --filter @brindin/shared build && pnpm --filter @brindin/frontend build

# Stage 3: Production runtime
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=build /app/packages/frontend/.next/standalone/ ./
COPY --from=build /app/packages/frontend/.next/static/ ./packages/frontend/.next/static/
# Copy public assets if they exist (will be a no-op until public/ has files)
COPY --from=build /app/packages/frontend/public/ ./packages/frontend/public/
COPY packages/frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "packages/frontend/server.js"]
