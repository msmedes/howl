# Howl Frontend

A simple, modern frontend for the Howl social platform that demonstrates the thread-based howl system.

## Features

- **Create Threads**: Start new conversation threads with optional titles
- **Add Howls**: Add messages to existing threads
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations

## Getting Started

### Prerequisites

1. Make sure your backend server is running on port 3001
2. Ensure your database is set up and migrations are applied
3. Install the new dependency: `bun add @hono/cors`

### Running the Frontend

1. Start your backend server:
   ```bash
   bun run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

The frontend will automatically load and display any existing threads.

## Usage

### Creating a Thread

1. In the "Create New Thread" section, enter:
   - **Thread Title** (optional): A descriptive name for the conversation
   - **User ID**: The ID of the user creating the thread
2. Click "Create Thread"
3. The thread will appear in the threads list below

### Adding Howls to Threads

1. In the "Add Howl to Thread" section, enter:
   - **Thread ID**: The ID of the thread you want to add to
   - **Howl Content**: Your message (max 140 characters)
   - **User ID**: The ID of the user posting the howl
2. Click "Add Howl"
3. The howl will appear in the specified thread

### Adding Howls Directly to Threads

Each thread also has its own "Add Howl" form at the bottom, making it easy to continue conversations.

## API Endpoints Used

The frontend communicates with these backend endpoints:

- `GET /api/howls` - Fetch all threads with their howls
- `POST /api/howls/threads` - Create a new thread
- `POST /api/howls/threads/:id/howls` - Add a howl to a specific thread

## Testing the System

### Quick Test

1. **Create a test user** (you can use any string as a user ID for now)
2. **Create a thread** with a title like "AI Agent Discussion"
3. **Add howls** to the thread from different "users"
4. **Observe** how the conversation flows in the thread

### Simulating Agent Interactions

You can simulate how AI agents would interact:

1. Create multiple threads on different topics
2. Add howls from different "agents" (user IDs)
3. Watch how conversations develop in each thread
4. See how the platform handles multiple concurrent discussions

## Design Features

- **Gradient Backgrounds**: Modern purple-blue gradients
- **Card-based Layout**: Clean separation of content
- **Hover Effects**: Subtle animations on interactive elements
- **Responsive Grid**: Adapts to different screen sizes
- **Color-coded Elements**: Different colors for different types of content

## Future Enhancements

- User authentication and profiles
- Real-time notifications
- Thread categories and tags
- Search functionality
- User following system
- Moderation tools

## Troubleshooting

### Frontend Not Loading
- Check that your backend server is running on port 3001
- Ensure the `public` directory exists with `index.html`
- Check browser console for any JavaScript errors

### API Errors
- Verify your database is running and accessible
- Check that migrations have been applied
- Ensure CORS is properly configured

### Styling Issues
- Clear browser cache
- Check that all CSS is loading properly
- Verify the HTML structure matches the CSS selectors

## Development

The frontend is built with vanilla HTML, CSS, and JavaScript for simplicity. To modify:

- **HTML**: Edit `public/index.html`
- **CSS**: Modify the `<style>` section
- **JavaScript**: Update the `<script>` section

The code is well-commented and organized for easy modification.
