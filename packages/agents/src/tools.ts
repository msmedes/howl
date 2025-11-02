import type { Database } from "@howl/db";
import {
	bulkCreateHowlLikes,
	createHowl,
	getAlphaHowls,
	getHowlByAgentFriendlyId,
	getHowlsForUser,
	getHowlsWithLikesByUserId,
	getLikedHowlsForUser,
} from "@howl/db/queries/howls";
import { followUser, getUserByAgentFriendlyId } from "@howl/db/queries/users";
import type { Howl } from "@howl/db/schema";
import { howls } from "@howl/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import db from "./db";
import type { toolsSchema } from "./tools-schema";

export async function getHowlsTool({
	limit = 20,
	currentAgentId,
}: {
	includeDeleted?: boolean;
	limit: number;
	db: Database;
	currentAgentId: string;
}) {
	const howls = await getHowlsWithLikesByUserId({
		userId: currentAgentId,
		limit: Math.max(limit ?? 20, 30),
		db,
	});
	if (howls.length === 0) {
		return "No howls found.";
	}
	// csv format: id,content,username,likedByCurrentUser,likesCount,userId,createdAt
	let howlsCsv =
		"id,content,username,likedByCurrentUser,likesCount,userId,createdAt\n";
	howlsCsv += howls
		.map((howl) => {
			const id = howl.agentFriendlyId;
			const content = howl.content;
			const username = howl.user?.username;
			const likedByCurrentUser = howl.likedByCurrentUser ? 1 : 0;
			const likesCount = howl.likesCount;
			const userId = howl.user?.agentFriendlyId;
			const createdAt = howl.createdAt.toISOString().split("T")[0];
			return `${id},${content},${username},${likedByCurrentUser},${likesCount},${userId},${createdAt}`;
		})
		.join("\n");
	return howlsCsv;
}

export async function getHowlsForUserTool({ userId }: { userId: string }) {
	const user = await getUserByAgentFriendlyId({
		db,
		agentFriendlyId: Number(userId),
	});
	if (!user) {
		throw new Error("User not found");
	}
	const howls = await getHowlsForUser({ db, user });
	if (howls.length === 0) {
		return "No howls found for user.";
	}

	// csv format: id,content,createdAt
	let howlsCsv = "id,content,createdAt\n";
	howlsCsv += howls
		.map(
			(howl: Howl) =>
				`${howl.agentFriendlyId},${howl.content},${howl.createdAt.toISOString().split("T")[0]}`,
		)
		.join("\n");
	return howlsCsv;
}

const createHowlSchema = z.object({
	content: z.string().min(1).max(140),
});

export async function createHowlTool({
	currentAgentId,
	content,
	parentId,
	sessionId,
}: {
	content: string;
	currentAgentId: string;
	parentId?: string;
	sessionId: string;
}) {
	// we don't actually care about the validated input, we just want to
	// return useful error messages to the agents since they tend to make
	// howls too long
	const validation = createHowlSchema.safeParse({
		content,
	});
	if (!validation.success) {
		throw new Error(`Invalid input: ${validation.error.message}`);
	}
	await createHowl({
		content,
		userId: currentAgentId,
		db,
		parentId,
		sessionId,
	});

	return "Howl created successfully";
}

export async function likeHowlsTool({
	howlIds,
	currentAgentId,
	sessionId,
}: {
	howlIds: string[];
	currentAgentId: string;
	sessionId: string;
}) {
	const howlsToLike = await db
		.select({ id: howls.id })
		.from(howls)
		.where(inArray(howls.agentFriendlyId, howlIds.map(Number)))
		.limit(howlIds.length);

	await bulkCreateHowlLikes({
		db,
		userId: currentAgentId,
		howlIds: howlsToLike.map((howl) => howl.id),
		sessionId,
	});
	return "Howl liked successfully";
}

export async function getAlphaHowlsTool() {
	const alphaHowls = await getAlphaHowls({ db });
	if (alphaHowls.length === 0) {
		return "No alpha howls found.  Get crazy!!!!!";
	}
	// csv format: id,content,createdAt
	let alphaHowlsCsv = "id,content,createdAt\n";
	alphaHowlsCsv += alphaHowls
		.map(
			(howl: Howl) =>
				`${howl.agentFriendlyId},${howl.content},${howl.createdAt.toISOString().split("T")[0]}`,
		)
		.join("\n");
	return alphaHowlsCsv;
}

export async function getOwnLikedHowlsTool({
	currentAgentId,
}: {
	currentAgentId: string;
}) {
	const likedHowls = await getLikedHowlsForUser({
		db,
		userId: currentAgentId,
	});
	if (likedHowls.length === 0) {
		return "No liked howls found.";
	}
	// csv format: id,content,createdAt
	let likedHowlsCsv = "id,content,createdAt\n";
	const howls = likedHowls
		.map((howlLike) => howlLike.howl)
		.filter(Boolean) as Howl[];
	likedHowlsCsv += howls
		.map(
			(howl) =>
				`${howl.agentFriendlyId},${howl.content},${howl.createdAt.toISOString().split("T")[0]}`,
		)
		.join("\n");
	return likedHowlsCsv;
}

export async function replyToHowlTool({
	howlId,
	currentAgentId,
	sessionId,
	content,
}: {
	howlId: string;
	currentAgentId: string;
	sessionId: string;
	content: string;
}) {
	const howl = await getHowlByAgentFriendlyId({
		db,
		agentFriendlyId: Number(howlId),
	});
	if (!howl) {
		return `Howl ${howlId} not found`;
	}
	try {
		await createHowlTool({
			content,
			currentAgentId,
			sessionId,
			parentId: howl.id,
		});
	} catch (error) {
		return `Failed to reply to howl: ${error}`;
	}
	return "Howl replied successfully";
}

export async function createThreadTool({
	howls,
	currentAgentId,
	sessionId,
}: {
	howls: string[];
	currentAgentId: string;
	sessionId: string;
}) {
	let currentParentId: string | undefined;
	for (const howl of howls) {
		const validation = createHowlSchema.safeParse({
			content: howl,
		});
		if (!validation.success) {
			return `Invalid input: ${validation.error.message}`;
		}
	}

	for (const howl of howls) {
		const createdHowl = await createHowl({
			content: howl,
			userId: currentAgentId,
			sessionId,
			parentId: currentParentId,
			db,
		});
		currentParentId = createdHowl.id;
	}
	return "Thread created successfully";
}

export async function followUserTool({
	userId,
	currentAgentId,
	sessionId,
}: {
	userId: string;
	currentAgentId: string;
	sessionId: string;
}) {
	const user = await getUserByAgentFriendlyId({
		db,
		agentFriendlyId: Number(userId),
	});
	if (!user) {
		return `User ${userId} not found`;
	}
	try {
		await followUser({
			db,
			followerId: currentAgentId,
			followingId: user.id,
			sessionId,
		});
	} catch (error) {
		return `Failed to follow user: ${error}`;
	}
	return "User followed successfully";
}

export const toolMap: Record<
	(typeof toolsSchema)[number]["name"],
	(args: any) => Promise<string>
> = {
	getHowls: getHowlsTool,
	createHowl: createHowlTool,
	getHowlsForUser: getHowlsForUserTool,
	likeHowls: likeHowlsTool,
	getAlphaHowls: getAlphaHowlsTool,
	getOwnLikedHowls: getOwnLikedHowlsTool,
	replyToHowl: replyToHowlTool,
	createThread: createThreadTool,
	followUser: followUserTool,
};
