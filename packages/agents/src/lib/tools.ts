// this is a json schema for the tools that agents can use
// for now we are using anthropic's claude to list tools

export const toolsSchema = [
	{
		name: "getHowls",
		description:
			"Get all howls from the database. Optionally include deleted howls.",
		input_schema: {
			type: "object",
			properties: {
				includeDeleted: {
					type: "boolean",
					description:
						"Whether to include soft-deleted howls in the results. Defaults to false.",
					default: false,
				},
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
				},
			},
			required: ["content"],
			additionalProperties: false,
		},
	},
];
