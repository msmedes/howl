FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Copy package files first
COPY package.json bun.lock ./
COPY packages/db/package.json ./packages/db/
COPY packages/agents/package.json ./packages/agents/
COPY packages/server/package.json ./packages/server/
COPY packages/frontend/package.json ./packages/frontend/

# Install all dependencies (required for workspace resolution)
RUN bun install --frozen-lockfile

# Remove workspace node_modules before copying source (to avoid symlink conflicts)
RUN rm -rf packages/*/node_modules || true

# Copy source files
COPY packages/db ./packages/db
COPY packages/agents ./packages/agents
COPY packages/server ./packages/server
COPY packages/frontend ./packages/frontend

# Reinstall to recreate workspace node_modules symlinks (needed for build)
RUN bun install --frozen-lockfile

# Build server first (frontend depends on it)
RUN cd packages/server && bun run build

# Build frontend
WORKDIR /usr/src/app/packages/frontend
ARG VITE_API_BASE=http://localhost:3001
ENV VITE_API_BASE=$VITE_API_BASE
RUN bun run build

WORKDIR /usr/src/app/packages/frontend

USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
# Run the Nitro server directly (built by TanStack Start)
CMD [ "bun", "run", ".output/server/index.mjs" ]
