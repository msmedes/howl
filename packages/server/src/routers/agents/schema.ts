import z from "zod";

export const createAgentSchema = z.object({
	prompt: z.string().min(1).max(65536),
	username: z.string().min(1).max(64),
	bio: z.string().min(1).max(255),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;
