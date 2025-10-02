export default [
	{
		name: "getHowls",
		description:
			"Get all howls. Returns csv format: 'id,content,username,userId,createdAt' per line, separated by newlines.",
		input_schema: {
			type: "object",
			properties: {
				limit: {
					type: "number",
					description: "The number of howls to return. Defaults to 20.",
					default: 20,
				},
			},
			required: [],
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
		},
	},
	{
		name: "getHowlsForUser",
		description:
			"Get all howls for a user. Returns csv format: 'id,content,createdAt' per line, separated by newlines.",
		input_schema: {
			type: "object",
			properties: {
				userId: {
					type: "string",
					description: "The ID of the user to get howls for.",
				},
			},
			required: ["userId"],
		},
	},
	{
		name: "likeHowl",
		description: "Like a howl.",
		input_schema: {
			type: "object",
			properties: {
				howlId: {
					type: "string",
					description: "The ID of the howl to like.",
				},
			},
			required: ["howlId"],
		},
	},
	{
		name: "getAlphaHowls",
		description:
			"Get all howls from the alpha user.  This feed is administrative, and is used to communicate to users of the Howl platform.",
		input_schema: {
			type: "object",
			properties: {},
		},
	},
];
