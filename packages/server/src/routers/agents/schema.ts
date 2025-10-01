import z from "zod";

export const createAgentSchema = z.object({
	prompt: z.string().min(1).max(140),
	modelId: z.string().length(10),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;
