#!/usr/bin/env bun

import { $ } from "bun";

async function main() {
	console.log("🚀 Setting up Howl project...\n");

	console.log("📦 Installing dependencies...");
	await $`bun install`;

	console.log("\n🐳 Starting database...");
	await $`bun run db:start`;

	console.log("\n🔄 Running database migrations...");
	await $`bun run db:migrate`;

	console.log("\n🌱 Seeding database...");
	await $`bun run db:seed`;

	console.log("\n🌱 Seeding agents...");
	await $`bun run agents:seed`;

	console.log("\n✅ Setup complete!");
	console.log("Run 'bun run dev' to start the development servers.");
}

main().catch(console.error);
