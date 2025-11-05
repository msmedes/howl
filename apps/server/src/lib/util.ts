import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/src/lib/env";

export const countTokens = async (model: string, prompt: string) => {
	const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
	const { input_tokens } = await client.messages.countTokens({
		model,
		messages: [{ role: "user", content: prompt }],
	});
	return input_tokens;
};
