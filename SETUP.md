# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

3. **Set up the database:**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Run the development server:**
   
   For standard Next.js (no WebSocket):
   ```bash
   pnpm dev
   ```
   
   For WebSocket support (requires custom server):
   ```bash
   pnpm dev:server
   ```

## WebSocket Setup

The game uses Socket.io for real-time multiplayer. To enable WebSocket support:

1. Use the custom server: `pnpm dev:server`
2. Or deploy with a platform that supports custom servers (Railway, Render, etc.)

For production, you may need to:
- Set up a separate WebSocket server
- Use a service like Pusher or Ably
- Configure your hosting platform to support WebSocket connections

## Database Setup

### PostgreSQL Options:

1. **Local PostgreSQL:**
   ```bash
   # Install PostgreSQL, then:
   createdb unirumble
   # Update DATABASE_URL in .env
   ```

2. **Supabase (Free tier available):**
   - Create project at supabase.com
   - Copy connection string to `.env`

3. **Vercel Postgres:**
   - Add Postgres database in Vercel dashboard
   - Connection string auto-configured

4. **Railway:**
   - Create PostgreSQL service
   - Copy connection string

## Creating Your First Admin User

After setting up the database, you can create an admin user via Prisma Studio:

```bash
pnpm db:studio
```

Or create a seed script to add an admin user.

## Testing the Application

1. **Sign up** a new account at `/auth/signup`
2. **Sign in** at `/auth/signin`
3. **View dashboard** at `/dashboard`
4. **Spin the wheel** at `/wheel` (once per week)
5. **Create a game** at `/game/lobby`
6. **Play the game** (requires WebSocket server running)

## Production Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Add PostgreSQL database (Vercel Postgres)
5. Deploy

**Note:** Vercel doesn't support custom servers. For WebSocket, use:
- Separate WebSocket server (Railway, Render)
- Or use Vercel's Edge Functions with WebSocket support (if available)

### Railway

1. Create new project
2. Add PostgreSQL service
3. Deploy from GitHub
4. Set environment variables
5. Run migrations: `pnpm db:migrate`

Railway supports custom servers, so WebSocket will work.

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running (if local)
- Ensure database exists

### WebSocket Not Connecting
- Make sure custom server is running (`pnpm dev:server`)
- Check `NEXT_PUBLIC_SOCKET_URL` matches your server URL
- Verify CORS settings in `lib/socket/server.ts`

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Build Errors
- Run `pnpm db:generate` before building
- Ensure all environment variables are set
- Check TypeScript errors: `pnpm lint`

