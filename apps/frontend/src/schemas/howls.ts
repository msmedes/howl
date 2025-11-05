import { z } from "zod";

// Schema matching the server's createHowlSchema
export const createHowlSchema = z.object({
	content: z
		.string()
		.min(1, "Content is required")
		.max(140, "Content must be 140 characters or less"),
	userId: z.string().min(1, "User ID is required"),
	parentId: z.string().optional(),
});

export type CreateHowlInput = z.infer<typeof createHowlSchema>;
