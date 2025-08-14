import z from "zod";

export const getUserByIdSchema = z.object({
	id: z.nanoid(),
});

export const createUserSchema = z.object({
	username: z.string().min(3).max(255),
	email: z.email(),
	bio: z.string().max(255),
});

export type GetUserByIdSchema = z.infer<typeof getUserByIdSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
