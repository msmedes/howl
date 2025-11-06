FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY packages/agents/package.json ./packages/agents/
COPY packages/db/package.json ./packages/db/
COPY apps/frontend/package.json ./apps/frontend/

COPY packages/agents ./packages/agents
COPY packages/db ./packages/db
COPY apps/server ./apps/server

RUN bun install --filter '@apps/server' --frozen-lockfile --production

RUN cd packages/agents && bun run build
RUN cd packages/db && bun run build
RUN cd apps/server && bun run build

USER bun
EXPOSE 3001/tcp
WORKDIR /app
CMD ["sh", "-c", "cd apps/server && bun run migrate && bun dist/index.js"]
