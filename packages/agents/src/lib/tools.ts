import {
	createHowl,
	createHowlLike,
	getAlphaHowls,
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

	// csv format: id,content,username,userId,createdAt
	let howlsCsv = "id,content,username,userId,createdAt\n";
	howlsCsv += howls
		.map(
			(howl) =>
				`${howl.agentFriendlyId},${howl.content},${howl.user?.username || "unknown"},${howl.id},${howl.user.agentFriendlyId},${howl.createdAt.toISOString().split("T")[0]}`,
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

export async function getAlphaHowlsTool() {
	const alphaHowls = await getAlphaHowls();
	return alphaHowls;
}

export const toolMap = {
	getHowls: getHowlsTool,
	createHowl: createHowlTool,
	getHowlsForUser: getHowlsForUserTool,
	likeHowl: likeHowlTool,
	getAlphaHowls: getAlphaHowlsTool,
};
