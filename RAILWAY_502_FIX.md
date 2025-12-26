# Fix: 502 Bad Gateway for /api/socket/ on Railway

## The Problem

You're getting `502 Bad Gateway` errors for requests to `/api/socket/` with "connection refused" errors. This means Railway can't reach your custom WebSocket server.

## Root Causes

1. **Railway might not be running the custom server** - It might be using Next.js's default server instead
2. **Server not starting properly** - The custom server might be crashing on startup
3. **Port/Hostname mismatch** - Railway might be routing to the wrong port

## Solutions

### Solution 1: Verify Server is Running

1. Go to Railway → Your Service → **Deploy Logs** (not Build Logs)
2. Look for these messages:
   ```
   > WebSocket server ready on http://0.0.0.0:PORT
   > Socket.io path: /api/socket
   ```
3. If you DON'T see these messages, the server isn't starting

### Solution 2: Check Railway Start Command

1. Go to Railway → Your Service → **Settings** → **Deploy**
2. Verify **Start Command** is set to: `tsx server.ts`
3. If it's set to `next start` or `npm start`, change it to `tsx server.ts`
4. Redeploy

### Solution 3: Check Build vs Runtime

Railway runs:
- **Build phase**: `pnpm run build` (creates Next.js build)
- **Runtime phase**: `tsx server.ts` (should run custom server)

Make sure Railway is using the custom server at runtime, not Next.js's built-in server.

### Solution 4: Verify Environment Variables

The server needs these variables:
- `PORT` - Railway sets this automatically (don't override)
- `HOSTNAME` - Should be `0.0.0.0` (already set in code)
- `DATABASE_URL` - For Prisma
- `NEXTAUTH_SECRET` - For authentication
- `NEXTAUTH_URL` - Your app URL

### Solution 5: Check for Startup Errors

1. Go to **Deploy Logs** (not Build Logs)
2. Look for errors during server startup
3. Common issues:
   - Database connection failures
   - Missing environment variables
   - Port already in use
   - Next.js build not found

### Solution 6: Railway Service Type

Make sure your Railway service is configured as:
- **Type**: Web Service (not Static Site)
- **Start Command**: `tsx server.ts`
- **Build Command**: `pnpm run build` (or leave default)

## Debugging Steps

### Step 1: Check Deploy Logs
```bash
# In Railway dashboard:
# Service → Deploy Logs tab
# Look for server startup messages
```

### Step 2: Add Debug Logging
The server now logs:
- Server ready message
- Port and hostname
- Environment info

Check if these appear in deploy logs.

### Step 3: Test Server Health
Try accessing your Railway URL directly:
```
https://your-service.railway.app
```

If this works but `/api/socket/` doesn't, the issue is with WebSocket routing.

### Step 4: Check Railway Routing
Railway should route ALL requests to your custom server. If it's routing some requests to Next.js and others to your server, that's the problem.

## Expected Behavior

✅ **Deploy Logs should show**:
```
> WebSocket server ready on http://0.0.0.0:PORT
> Socket.io path: /api/socket
> Environment: production
> PORT: XXXX, HOSTNAME: 0.0.0.0
```

✅ **HTTP Logs should show**:
- 200 status for successful WebSocket connections
- No 502 errors

## If Still Failing

1. **Check Railway's service type** - Must be "Web Service"
2. **Verify start command** - Must be `tsx server.ts`
3. **Check for port conflicts** - Railway sets PORT automatically
4. **Review deploy logs** - Look for any error messages
5. **Try using compiled version**:
   - Change start command to: `node dist/server.js`
   - Make sure `build:server` runs during build

## Alternative: Use Compiled Server

If `tsx` isn't working, use the compiled version:

1. Update `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm build && pnpm build:server"
  },
  "deploy": {
    "startCommand": "node dist/server.js"
  }
}
```

2. Redeploy

This compiles TypeScript first, then runs the compiled JavaScript.

