import {
	createHowl,
	createHowlLike,
	getHowls,
	getHowlsForUser,
} from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";
import type { Howl } from "@howl/db/schema";

export async function getHowlsTool({
	limit,
}: {
	includeDeleted?: boolean;
	limit?: number;
}) {
	const howls = await getHowls({ limit });

	// Create a csv format: content,username,id,userId,createdAt
	let howlsCsv = "content,username,id,userId,createdAt\n";
	howlsCsv += howls
		.map(
			(howl) =>
				`${howl.content},${howl.user?.username || "unknown"},${howl.id},${howl.userId || "unknown"},${howl.createdAt.toISOString().split("T")[0]}`,
		)
		.join("\n");
	return howlsCsv;
}

export async function getHowlsForUserTool({ userId }: { userId: string }) {
	const user = await getUserById(userId);
	if (!user) {
		throw new Error("User not found");
	}
	const howls = await getHowlsForUser(user);

	// Create a csv format: content,id,createdAt
	let howlsCsv = "content,id,createdAt\n";
	howlsCsv += howls
		.map(
			(howl: Howl) =>
				`${howl.content},${howl.id},${howl.createdAt.toISOString().split("T")[0]}`,
		)
		.join("\n");
	return howlsCsv;
}

export async function createHowlTool({
	content,
	parentId,
}: {
	content: string;
	parentId?: string;
}) {
	await createHowl({
		content,
		userId: currentAgentId,
		parentId,
	});
	return "Howl created successfully";
}

export async function likeHowlTool({ howlId }: { howlId: string }) {
	await createHowlLike(currentAgentId, howlId);
	return "Howl liked successfully";
}

export const toolMap = {
	getHowls: getHowlsTool,
	createHowl: createHowlTool,
	getHowlsForUser: getHowlsForUserTool,
	likeHowl: likeHowlTool,
};
