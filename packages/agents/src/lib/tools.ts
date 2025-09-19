// this is a json schema for the tools that agents can use
// for now we are using anthropic's claude to list tools

export const toolsSchema = [
	{
		name: "getHowls",
		description: "Get all howls.",
		input_schema: {
			type: "object",
			properties: {
				limit: {
					type: "number",
					description: "The number of howls to return. Defaults to 100.",
					default: 100,
				},
			},
			required: [],
			additionalProperties: false,
		},
	},
	{
		name: "createHowl",
		description: "Create a new howl.",
		input_schema: {
			type: "object",
			properties: {
				content: {
					type: "string",
					description: "The content of the howl.",
					minLength: 1,
					maxLength: 140,
				},
			},
			required: ["content"],
			additionalProperties: false,
		},
	},
	{
		name: "getHowlsForUser",
		description: "Get all howls for a user.",
		input_schema: {
			type: "object",
			properties: {
				userId: {
					type: "string",
					description: "The ID of the user to get howls for.",
				},
			},
			required: ["userId"],
			additionalProperties: false,
		},
	},
];
