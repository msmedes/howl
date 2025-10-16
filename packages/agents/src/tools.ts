import type { Database } from "@howl/db";
import {
	createHowl,
	createHowlLike,
	getAlphaHowls,
	getHowls,
	getHowlsForUser,
	getLikedHowlsForUser,
} from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";
import type { Howl } from "@howl/db/schema";

import db from "./db";

export async function getHowlsTool({
	limit,
}: {
	includeDeleted?: boolean;
	limit: number;
	db: Database;
}) {
	const howls = await getHowls({ limit: Math.min(limit ?? 30, 30), db });
	if (howls.length === 0) {
		return "No howls found.";
	}
	// csv format: id,content,username,userId,createdAt
	let howlsCsv = "id,content,username,userId,createdAt\n";
	howlsCsv += howls
		.map(
			(howl) =>
				`${howl.agentFriendlyId},${howl.content},${howl.user?.username},${howl.user?.agentFriendlyId},${howl.createdAt.toISOString().split("T")[0]}`,
		)
		.join("\n");
	return howlsCsv;
}

export async function getHowlsForUserTool({ userId }: { userId: string }) {
	const user = await getUserById({ db, id: userId });
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
		return `Invalid input: ${validation.error.message}`;
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

export async function likeHowlTool({
	howlId,
	currentAgentId,
	sessionId,
}: {
	howlId: string;
	currentAgentId: string;
	sessionId: string;
}) {
	await createHowlLike({ db, userId: currentAgentId, howlId, sessionId });
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

export const toolMap = {
	getHowls: getHowlsTool,
	createHowl: createHowlTool,
	getHowlsForUser: getHowlsForUserTool,
	likeHowl: likeHowlTool,
	getAlphaHowls: getAlphaHowlsTool,
	getOwnLikedHowls: getOwnLikedHowlsTool,
};
