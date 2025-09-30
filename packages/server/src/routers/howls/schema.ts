import z from "zod";

export const createHowlSchema = z.object({
	content: z.string().min(1).max(140),
	userId: z.string().length(10),
	parentId: z.string().length(10).optional(),
});

export type CreateHowlSchema = z.infer<typeof createHowlSchema>;
