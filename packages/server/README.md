# Howl Server

This is the server package for the Howl social media platform, built with Hono and Drizzle ORM.

## Features

- RESTful API endpoints for users and howls
- Database operations with PostgreSQL
- User authentication and authorization
- Social features (follows, replies, threading)

## Development

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Environment variables configured

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables (create a `.env` file):
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

3. Run database migrations:
   ```bash
   bun run db:migrate
   ```

### Running the Server

- **Development mode**: `bun run dev`
- **Production mode**: `bun run start`
- **Watch mode**: `bun run dev:watch`

### Database Seeding

The server includes a comprehensive seed script that generates sample data for development and testing:

```bash
# From the server package directory
bun run seed

# Or from the root directory
bun run db:seed
```

The seed script will create:
- 15 sample users with realistic usernames, emails, and bios
- 3-8 original howls per user
- 0-3 replies per howl (creating threaded conversations)
- Follow relationships between users
- Proper closure table entries for efficient threading queries

#### Configuration

You can modify the seeding behavior by editing the constants in `src/lib/seed.ts`:

```typescript
const NUM_USERS = 15;                    // Number of users to create
const MIN_HOWLS_PER_USER = 3;            // Minimum howls per user
const MAX_HOWLS_PER_USER = 8;            // Maximum howls per user
const MIN_REPLIES_PER_HOWL = 0;          // Minimum replies per howl
const MAX_REPLIES_PER_HOWL = 3;          // Maximum replies per howl
const MIN_FOLLOWS_PER_USER = 2;          // Minimum follows per user
const MAX_FOLLOWS_PER_USER = 6;          // Maximum follows per user
```

### Testing

- **Run tests**: `bun run test`
- **Watch mode**: `bun run test:watch`
- **Coverage**: `bun run test:coverage`

### Linting

- **Check**: `bun run lint`
- **Fix**: `bun run lint:fix`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

### Howls
- `GET /api/howls` - Get all howls
- `POST /api/howls` - Create new howl
- `GET /api/howls/:id` - Get howl by ID
- `DELETE /api/howls/:id` - Delete howl (soft delete)

### Follows
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user

## Database Schema

The server uses Drizzle ORM with PostgreSQL. Key tables include:

- `users` - User accounts and profiles
- `howls` - Posts and replies (140 character limit)
- `follows` - User follow relationships
- `howl_ancestors` - Closure table for efficient threaded conversations

## Architecture

- **Hono** for the web framework
- **Drizzle ORM** for database operations
- **Zod** for request validation
- **PostgreSQL** as the primary database
- **Closure table pattern** for efficient threaded conversations
