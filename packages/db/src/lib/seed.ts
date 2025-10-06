import { createDatabase } from "@howl/db";
import { users } from "@howl/db/schema";
import { getUserByUsername } from "@/queries/users";

const db = createDatabase({
	databaseUrl: process.env.DATABASE_URL as string,
});

async function main() {
	console.log("🌱 Starting database seeding...");

	try {
		const userExists = await getUserByUsername({
			db,
			username: "alpha",
		});
		if (userExists) {
			console.log("🌱 Alpha user already exists");
			return;
		}
		await db
			.insert(users)
			.values({
				username: "alpha",
				email: "alpha@howl.com",
				bio: "leader of the pack",
			})
			.returning();
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		throw error;
	}
}

if (import.meta.main) {
	main()
		.then(() => {
			console.log("🎉 Seeding finished!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Seeding failed:", error);
			process.exit(1);
		});
}

export { main as seedDatabase };
