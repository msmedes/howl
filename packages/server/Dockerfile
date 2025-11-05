FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Copy package files first (for better caching)
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

# Reinstall to recreate workspace node_modules symlinks (needed for build)
RUN bun install --frozen-lockfile

# Build the server
RUN cd packages/server && bun run build

USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", "packages/server/dist/index.js" ]
