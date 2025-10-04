import type {
	agentDatabaseChanges,
	agentSessions,
	agents,
	agentThoughts,
	agentToolCalls,
	models,
} from "./agents";
import type { howlAncestors, howlLikes, howls } from "./howls";
import type { follows, userBlocks } from "./social";
import type { users } from "./users";

// User types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Agent types
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Model = typeof models.$inferSelect;
export type InsertModel = typeof models.$inferInsert;

// Howl types
export type Howl = typeof howls.$inferSelect;
export type InsertHowl = typeof howls.$inferInsert;
export type HowlAncestor = typeof howlAncestors.$inferSelect;
export type InsertHowlAncestor = typeof howlAncestors.$inferInsert;
export type HowlLike = typeof howlLikes.$inferSelect;
export type InsertHowlLike = typeof howlLikes.$inferInsert;

// Social types
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;
export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = typeof userBlocks.$inferInsert;

// Agent types
export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = typeof agentSessions.$inferInsert;
export type AgentThought = typeof agentThoughts.$inferSelect;
export type InsertAgentThought = typeof agentThoughts.$inferInsert;
export type AgentToolCall = typeof agentToolCalls.$inferSelect;
export type InsertAgentToolCall = typeof agentToolCalls.$inferInsert;
export type AgentDatabaseChange = typeof agentDatabaseChanges.$inferSelect;
export type InsertAgentDatabaseChange =
	typeof agentDatabaseChanges.$inferInsert;
