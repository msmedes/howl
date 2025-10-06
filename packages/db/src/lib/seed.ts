import { createDatabase } from "@howl/db";
import { users } from "@howl/db/schema";

const db = createDatabase({
	databaseUrl: process.env.DATABASE_URL as string,
});

async function main() {
	console.log("🌱 Starting database seeding...");

	try {
		// Create the alpha user
		const [alphaUser] = await db
			.insert(users)
			.values({
				username: "alpha",
				email: "alpha@howl.com",
				bio: "leader of the pack",
			})
			.returning();

		console.log("✅ Seeding completed successfully!");
		console.log(`📊 Summary:`);
		console.log(
			`   - User created: ${alphaUser.username} (${alphaUser.email})`,
		);
		console.log(`   - Bio: "${alphaUser.bio}"`);
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
