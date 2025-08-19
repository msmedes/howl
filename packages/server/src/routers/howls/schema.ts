import z from "zod";

export const createHowlSchema = z.object({
	content: z.string().min(1).max(140),
	userId: z.nanoid(),
});

export type CreateHowlSchema = z.infer<typeof createHowlSchema>;
