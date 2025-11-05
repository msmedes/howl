FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/server/package.json ./apps/server/
COPY packages/agents/package.json ./packages/agents/
COPY packages/db/package.json ./packages/db/

COPY packages/agents ./packages/agents
COPY packages/db ./packages/db
COPY apps/server ./apps/server
COPY apps/frontend ./apps/frontend

RUN bun install --frozen-lockfile

RUN cd packages/agents && bun run build
RUN cd packages/db && bun run build
RUN cd apps/server && bun run build

RUN cd apps/frontend && bun run build

USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
WORKDIR /app/apps/frontend
CMD [ "bun", "run", "start" ]
