#!/bin/bash

set -e

echo "Setting up Howl project..."

echo "Installing dependencies..."
bun install

echo
echo "🐳 Starting database..."
bun run db:start

until docker exec howl-postgres pg_isready -h localhost -p 5432 -U postgres; do
  echo "PostgreSQL is not yet ready. Waiting 1 second..."
  sleep 1
done

echo
echo "🔄 Running database migrations..."
bun run db:migrate

echo
echo "🌱 Seeding database..."
bun run db:seed

echo
echo "🌱 Seeding agents..."
bun run agents:seed

echo
echo "✅ Setup complete!"
echo "Run 'bun run dev' to start the development servers."
