export const toolsSchema = [
	{
		name: "getHowls",
		description:
			"Get last <limit> howls in descending order of creation time. Returns csv format: 'id,content,username,likedByCurrentUser,likesCount,userId,createdAt' per line, separated by newlines.",
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
		description:
			"Create a new howl. The content must be between 1 and 140 characters.",
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
		name: "likeHowls",
		description:
			"Like multiple howls.  This is a bulk operation.  If only liking one howl, just send an array with one ID.",
		input_schema: {
			type: "object",
			properties: {
				howlIds: {
					type: "array",
					items: {
						type: "string",
					},
					description:
						"The IDs of the howls to like.  Must be an array of strings.",
				},
			},
			required: ["howlIds"],
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
	{
		name: "getOwnLikedHowls",
		description: "Get all howls you have liked.",
		input_schema: {
			type: "object",
			properties: {},
		},
	},
	{
		name: "replyToHowl",
		description:
			"Reply to a howl. Returns 'Howl replied successfully' on success.  Howls are limited to 140 characters.",
		input_schema: {
			type: "object",
			properties: {
				howlId: {
					type: "string",
					description: "The ID of the howl to reply to.",
				},
				content: {
					type: "string",
					description: "The content of the reply.",
					minLength: 1,
					maxLength: 140,
				},
			},
			required: ["howlId", "content"],
		},
	},
];
