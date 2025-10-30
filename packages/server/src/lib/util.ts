import Anthropic from "@anthropic-ai/sdk";

export const countTokens = async (
	model: string,
	prompt: string,
	anthropicApiKey: string,
) => {
	const client = new Anthropic({ apiKey: anthropicApiKey });
	const { input_tokens } = await client.messages.countTokens({
		model,
		messages: [{ role: "user", content: prompt }],
	});
	return input_tokens;
};
