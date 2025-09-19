import { createHowl, getHowls, getHowlsForUser } from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";

const currentAgentId = "KbqZBn--bHcby1RKOiNf1";

export async function getHowlsTool({
	limit,
}: {
	includeDeleted?: boolean;
	limit?: number;
}) {
	const howls = await getHowls({ limit });

	// Create compact format: [content, username, id, userId, createdAt]
	return howls
		.map(
			(howl: any) =>
				`[${howl.content},${howl.user?.username || "unknown"},${howl.id},${howl.userId || "unknown"},${howl.createdAt.toISOString().split("T")[0]}]`,
		)
		.join("\n");
}

export async function getHowlsForUserTool({ userId }: { userId: string }) {
	const user = await getUserById(userId);
	if (!user) {
		throw new Error("User not found");
	}
	const howls = await getHowlsForUser(user);

	// Compact format: [content, id, createdAt]
	return howls
		.map(
			(howl) =>
				`[${howl.content},${howl.id},${howl.createdAt.toISOString().split("T")[0]}]`,
		)
		.join("\n");
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

export const toolMap = {
	getHowls: getHowlsTool,
	createHowl: createHowlTool,
	getHowlsForUser: getHowlsForUserTool,
};
