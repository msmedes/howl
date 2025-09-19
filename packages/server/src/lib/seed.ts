import { faker } from "@faker-js/faker";
import db from "@howl/db";
import type * as schema from "@howl/db/schema";
import {
	follows,
	howlAncestors,
	howls,
	userBlocks,
	users,
} from "@howl/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// Configuration
const NUM_USERS = 15;
const MIN_HOWLS_PER_USER = 3;
const MAX_HOWLS_PER_USER = 8;
const MIN_REPLIES_PER_HOWL = 0;
const MAX_REPLIES_PER_HOWL = 3;
const MIN_FOLLOWS_PER_USER = 2;
const MAX_FOLLOWS_PER_USER = 6;
const MIN_BLOCKS_PER_USER = 0;
const MAX_BLOCKS_PER_USER = 3;

// Sample howl content templates for variety
const HOWL_TEMPLATES = [
	"Just had the most amazing coffee this morning! ☕️",
	"Working on some exciting new projects today",
	"Can't believe how beautiful the weather is today",
	"Anyone else binge-watching that new show?",
	"Great workout session this morning 💪",
	"Missing traveling so much right now ✈️",
	"Finally finished that book I've been reading",
	"Nothing beats a quiet evening at home",
	"Today's productivity level: 📈",
	"Random thought: what if we all just...",
	"Sometimes you just need to take a deep breath",
	"Learning something new every day",
	"Grateful for all the amazing people in my life",
	"Music is truly the universal language 🎵",
	"Sometimes the best ideas come at 3 AM",
	"Life is what happens while you're busy making plans",
	"Finding joy in the little things today",
	"Anyone else feel like time is moving too fast?",
	"Perfect day for a long walk",
	"Sometimes you just need to laugh at yourself 😄",
];

// Sample bio templates
const BIO_TEMPLATES = [
	"Digital nomad exploring the world one coffee shop at a time ☕️",
	"Tech enthusiast with a passion for innovation",
	"Creative soul seeking inspiration everywhere",
	"Adventure seeker and story collector",
	"Building the future, one line of code at a time",
	"Professional daydreamer and amateur photographer",
	"Life-long learner with a curious mind",
	"Finding beauty in the everyday moments",
	"Passionate about connecting people and ideas",
	"Living life on my own terms",
	"Exploring the intersection of art and technology",
	"Always up for a good conversation",
	"Making the world a little bit better each day",
	"Professional overthinker and coffee addict",
	"Finding magic in the mundane",
];

interface SeedUser {
	id: string;
	username: string;
	email: string;
	bio: string;
}

interface SeedHowl {
	id: string;
	content: string;
	userId: string;
	parentId?: string;
	isOriginalPost: boolean;
}

interface SeedFollow {
	followerId: string;
	followingId: string;
}

interface SeedBlock {
	userId: string;
	blockedUserId: string;
}

async function generateUsers(
	db: NodePgDatabase<typeof schema>,
): Promise<SeedUser[]> {
	const generatedUsers: SeedUser[] = [];
	const usedUsernames = new Set<string>();
	const usedEmails = new Set<string>();

	for (let i = 0; i < NUM_USERS; i++) {
		let username: string;
		let email: string;

		// Generate unique username
		do {
			username = faker.internet.username();
		} while (usedUsernames.has(username));
		usedUsernames.add(username);

		// Generate unique email
		do {
			email = faker.internet.email();
		} while (usedEmails.has(email));
		usedEmails.add(email);

		const bio = faker.helpers.arrayElement(BIO_TEMPLATES);

		const [user] = await db
			.insert(users)
			.values({
				username,
				email,
				bio,
			})
			.returning();

		generatedUsers.push({
			id: user.id,
			username,
			email,
			bio,
		});

		console.log(`Created user: ${username} (${email})`);
	}

	return generatedUsers;
}

async function generateHowls(
	db: NodePgDatabase<typeof schema>,
	userList: SeedUser[],
): Promise<SeedHowl[]> {
	const allHowls: SeedHowl[] = [];

	for (const user of userList) {
		const numHowls = faker.number.int({
			min: MIN_HOWLS_PER_USER,
			max: MAX_HOWLS_PER_USER,
		});

		for (let i = 0; i < numHowls; i++) {
			const content = faker.helpers.arrayElement(HOWL_TEMPLATES);

			const [howl] = await db
				.insert(howls)
				.values({
					content,
					userId: user.id,
					isOriginalPost: true,
				})
				.returning();

			const seedHowl: SeedHowl = {
				id: howl.id,
				content,
				userId: user.id,
				isOriginalPost: true,
			};

			allHowls.push(seedHowl);
			console.log(
				`Created howl for ${user.username}: "${content.substring(0, 50)}..."`,
			);
		}
	}

	return allHowls;
}

async function generateReplies(
	db: NodePgDatabase<typeof schema>,
	userList: SeedUser[],
	originalHowls: SeedHowl[],
): Promise<SeedHowl[]> {
	const allReplies: SeedHowl[] = [];

	for (const howl of originalHowls) {
		const numReplies = faker.number.int({
			min: MIN_REPLIES_PER_HOWL,
			max: MAX_REPLIES_PER_HOWL,
		});

		for (let i = 0; i < numReplies; i++) {
			const randomUser = faker.helpers.arrayElement(userList);
			const content = faker.helpers.arrayElement(HOWL_TEMPLATES);

			const [reply] = await db
				.insert(howls)
				.values({
					content,
					userId: randomUser.id,
					parentId: howl.id,
					isOriginalPost: false,
				})
				.returning();

			const seedReply: SeedHowl = {
				id: reply.id,
				content,
				userId: randomUser.id,
				parentId: howl.id,
				isOriginalPost: false,
			};

			allReplies.push(seedReply);
			console.log(
				`Created reply from ${randomUser.username} to ${howl.content.substring(0, 30)}..."`,
			);
		}
	}

	return allReplies;
}

async function populateClosureTable(
	db: NodePgDatabase<typeof schema>,
	allHowls: SeedHowl[],
): Promise<void> {
	// First, add self-references for all howls (depth 0)
	for (const howl of allHowls) {
		await db.insert(howlAncestors).values({
			ancestorId: howl.id,
			descendantId: howl.id,
			depth: 0,
		});
	}

	// Then, add parent-child relationships for replies (depth 1)
	for (const howl of allHowls) {
		if (howl.parentId) {
			await db.insert(howlAncestors).values({
				ancestorId: howl.parentId,
				descendantId: howl.id,
				depth: 1,
			});
		}
	}

	console.log(`Populated closure table for ${allHowls.length} howls`);
}

async function generateFollows(
	db: NodePgDatabase<typeof schema>,
	userList: SeedUser[],
): Promise<SeedFollow[]> {
	const allFollows: SeedFollow[] = [];
	const followPairs = new Set<string>();

	for (const user of userList) {
		const numFollows = faker.number.int({
			min: MIN_FOLLOWS_PER_USER,
			max: MAX_FOLLOWS_PER_USER,
		});
		const potentialFollows = userList.filter((u) => u.id !== user.id);
		const shuffledFollows = faker.helpers.shuffle(potentialFollows);

		let followsCreated = 0;
		for (const following of shuffledFollows) {
			if (followsCreated >= numFollows) break;

			const followKey = `${user.id}-${following.id}`;
			if (!followPairs.has(followKey)) {
				await db.insert(follows).values({
					followerId: user.id,
					followingId: following.id,
				});

				allFollows.push({
					followerId: user.id,
					followingId: following.id,
				});

				followPairs.add(followKey);
				followsCreated++;

				console.log(`${user.username} is now following ${following.username}`);
			}
		}
	}

	return allFollows;
}

async function generateBlocks(
	db: NodePgDatabase<typeof schema>,
	userList: SeedUser[],
): Promise<SeedBlock[]> {
	const allBlocks: SeedBlock[] = [];
	const blockPairs = new Set<string>();

	for (const user of userList) {
		const numBlocks = faker.number.int({
			min: MIN_BLOCKS_PER_USER,
			max: MAX_BLOCKS_PER_USER,
		});
		const potentialBlocks = userList.filter((u) => u.id !== user.id);
		const shuffledBlocks = faker.helpers.shuffle(potentialBlocks);

		let blocksCreated = 0;
		for (const blockedUser of shuffledBlocks) {
			if (blocksCreated >= numBlocks) break;

			const blockKey = `${user.id}-${blockedUser.id}`;
			if (!blockPairs.has(blockKey)) {
				await db.insert(userBlocks).values({
					userId: user.id,
					blockedUserId: blockedUser.id,
				});

				allBlocks.push({
					userId: user.id,
					blockedUserId: blockedUser.id,
				});

				blockPairs.add(blockKey);
				blocksCreated++;

				console.log(`${user.username} has blocked ${blockedUser.username}`);
			}
		}
	}

	return allBlocks;
}

async function checkExistingData(
	db: NodePgDatabase<typeof schema>,
): Promise<boolean> {
	try {
		const firstUser = await db.query.users.findFirst();
		const firstHowl = await db.query.howls.findFirst();
		return !!firstUser || !!firstHowl;
	} catch (error) {
		// If there's an error, assume no existing data
		return false;
	}
}

async function main() {
	console.log("🌱 Starting database seeding...");

	try {
		// Check if there's existing data
		const hasExistingData = await checkExistingData(db);
		if (hasExistingData) {
			console.log(
				"⚠️  Warning: Database already contains data. Consider clearing it first for a clean seed.",
			);
			console.log("   You can continue, but this may create duplicate data.");
		}

		// Use a transaction to ensure data consistency
		await db.transaction(async (tx) => {
			// Generate users
			console.log("\n👥 Generating users...");
			const userList = await generateUsers(tx);

			// Generate original howls
			console.log("\n📝 Generating original howls...");
			const originalHowls = await generateHowls(tx, userList);

			// Generate replies
			console.log("\n💬 Generating replies...");
			const replies = await generateReplies(tx, userList, originalHowls);

			// Populate closure table for threading
			console.log("\n🔗 Populating closure table...");
			const allHowls = [...originalHowls, ...replies];
			await populateClosureTable(tx, allHowls);

			// Generate follow relationships
			console.log("\n👥 Generating follow relationships...");
			const followRelationships = await generateFollows(tx, userList);

			// Generate block relationships
			console.log("\n🚫 Generating block relationships...");
			const blockRelationships = await generateBlocks(tx, userList);

			// Summary
			console.log("\n✅ Seeding completed successfully!");
			console.log(`📊 Summary:`);
			console.log(`   - Users created: ${userList.length}`);
			console.log(`   - Original howls created: ${originalHowls.length}`);
			console.log(`   - Replies created: ${replies.length}`);
			console.log(
				`   - Follow relationships created: ${followRelationships.length}`,
			);
			console.log(
				`   - Block relationships created: ${blockRelationships.length}`,
			);
			console.log(`   - Total howls: ${allHowls.length}`);
			console.log(
				`   - Closure table entries: ${allHowls.length + replies.length}`,
			);
		});
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		throw error;
	}
}

// Run the seeding if this file is executed directly
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
