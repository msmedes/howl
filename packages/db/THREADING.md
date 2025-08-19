# Howl Threading System

This document explains the new threading system for howls using a self-referential approach with a closure table.

## Schema Overview

### Tables

1. **`howls`** - Main table storing all howls
   - `id` - Unique identifier
   - `content` - Howl content (max 140 chars)
   - `userId` - Reference to user who created the howl
   - `parentId` - Self-reference to parent howl (for replies)
   - `isOriginalPost` - Boolean flag indicating if this is an original post
   - `createdAt` / `updatedAt` - Timestamps

2. **`howlAncestors`** - Closure table for efficient tree queries
   - `ancestorId` - Reference to ancestor howl
   - `descendantId` - Reference to descendant howl
   - `depth` - Distance between ancestor and descendant
   - `createdAt` / `updatedAt` - Timestamps

## How It Works

### Creating Original Posts
When a user creates a new howl (not a reply):
```typescript
const howl = await db.insert(howls).values({
  content: "Hello world!",
  userId: "user123",
  isOriginalPost: true,
}).returning();

// Insert self-reference in closure table
await db.insert(howlAncestors).values({
  ancestorId: howl[0].id,
  descendantId: howl[0].id,
  depth: 0,
});
```

### Creating Replies
When a user replies to an existing howl:
```typescript
const reply = await db.insert(howls).values({
  content: "Great post!",
  userId: "user456",
  parentId: "originalHowlId",
  isOriginalPost: false,
}).returning();

// Populate closure table automatically
await populateClosureTable(reply[0].id, "originalHowlId");
```

### Closure Table Population
The `populateClosureTable` function automatically creates all necessary ancestor-descendant relationships:

1. **Self-reference**: `(newHowl, newHowl, depth: 0)`
2. **Direct parent**: `(parentHowl, newHowl, depth: 1)`
3. **All ancestors**: `(ancestorHowl, newHowl, depth: ancestorDepth + 1)`

## Query Examples

### Get Entire Thread
```typescript
const thread = await db
  .select({
    howl: howls,
    user: { id: users.id, username: users.username, bio: users.bio },
    depth: howlAncestors.depth,
  })
  .from(howlAncestors)
  .innerJoin(howls, eq(howlAncestors.descendantId, howls.id))
  .innerJoin(users, eq(howls.userId, users.id))
  .where(eq(howlAncestors.ancestorId, rootHowlId))
  .orderBy(howlAncestors.depth, howls.createdAt);
```

### Get Original Posts Only
```typescript
const originalPosts = await db
  .select()
  .from(howls)
  .where(eq(howls.isOriginalPost, true));
```

### Get User's Replies
```typescript
const replies = await db
  .select()
  .from(howls)
  .where(and(
    eq(howls.userId, userId),
    eq(howls.isOriginalPost, false)
  ));
```

## Benefits

1. **Flexible Threading**: Any howl can reply to any other howl
2. **Efficient Queries**: No recursive queries needed for tree operations
3. **Profile Filtering**: Easy to separate original posts from replies
4. **Scalable**: Works well with deep nesting and large numbers of replies
5. **Simple Relations**: Clear parent-child relationships

## Migration Notes

When migrating from the old `howlThreads` approach:

1. **Phase 1**: Add `parentId` and `isOriginalPost` to existing `howls` table
2. **Phase 2**: Create the `howlAncestors` closure table
3. **Phase 3**: Populate closure table for existing data
4. **Phase 4**: Remove `howlThreads` table and update queries

## Performance Considerations

- **Closure table size**: Grows with the square of thread depth
- **Indexes**: Ensure proper indexing on `ancestorId`, `descendantId`, and `depth`
- **Batch operations**: Use transactions for multiple closure table inserts
- **Cleanup**: Consider archiving old threads to manage closure table size

## Example Thread Structure

```
Howl A (root, depth 0)
├── Howl B (reply to A, depth 1)
│   ├── Howl D (reply to B, depth 2)
│   └── Howl E (reply to B, depth 2)
└── Howl C (reply to A, depth 1)
    └── Howl F (reply to C, depth 2)
```

The closure table would contain all possible ancestor-descendant relationships, making it easy to query the entire tree or any subtree efficiently.
