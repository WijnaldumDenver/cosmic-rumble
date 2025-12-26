# Vercel Deployment Guide

## Required Environment Variables

Make sure to set these environment variables in your Vercel project settings:

### 1. Database (REQUIRED)

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### 2. NextAuth (REQUIRED)

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

**To generate a secure NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### 3. Socket.io (OPTIONAL - See WebSocket Note Below)

```
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app
```

**⚠️ Important WebSocket Note for Vercel:**
Vercel does NOT support custom Node.js servers, which means the WebSocket server (`server.ts`) won't work on Vercel. You have two options:

**Option A: Deploy Custom Server Separately (Recommended)**

1. Deploy the custom server (`server.ts`) to Railway, Render, or another platform that supports WebSockets
2. Set `NEXT_PUBLIC_SOCKET_URL` to that server's URL (e.g., `https://your-socket-server.railway.app`)
3. Keep the Next.js app on Vercel

**Option B: Use Alternative Real-time Solution**

- Use Pusher, Ably, or similar WebSocket-as-a-Service
- Update the code to use their SDK instead of Socket.io
- Set `NEXT_PUBLIC_SOCKET_URL` accordingly

**For Local Development:**

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:

   - **Key**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environment**: Production, Preview, Development (select all)

4. Repeat for:
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET` (generated secret)
   - `NEXT_PUBLIC_SOCKET_URL` (if needed)

## Important Notes

- **NEXTAUTH_SECRET** is REQUIRED for production. Without it, authentication will fail.
- Never commit `.env` files to git
- Vercel automatically runs `prisma generate` during build (via `postinstall` script)
- After adding environment variables, redeploy your application

## Troubleshooting

### Error: `[next-auth][error][NO_SECRET]`

- **Solution**: Add `NEXTAUTH_SECRET` to Vercel environment variables

### Error: `PrismaClientInitializationError`

- **Solution**: Ensure `DATABASE_URL` is set correctly
- The build script automatically runs `prisma generate`

### Build Fails

- Check that all required environment variables are set
- Verify database connection string is correct
- Check Vercel build logs for specific errors
