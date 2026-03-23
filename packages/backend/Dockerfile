# Stage 1: Install dependencies
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM base AS build
COPY packages/shared/ ./packages/shared/
COPY packages/backend/ ./packages/backend/
COPY tsconfig.json ./

RUN pnpm --filter @brindin/shared build && pnpm --filter @brindin/backend build

# Stage 3: Production runtime
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY --from=build /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/backend/package.json ./packages/backend/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=build /app/packages/backend/dist/ ./packages/backend/dist/
COPY --from=build /app/packages/backend/drizzle/ ./packages/backend/drizzle/

EXPOSE 3001
CMD ["node", "packages/backend/dist/server/index.js"]
