# Deploying WebSocket Server to Railway

This guide will help you deploy the custom WebSocket server (`server.ts`) to Railway so you can enable real-time multiplayer features.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. Your Next.js app already deployed (on Vercel or elsewhere)
3. Your database connection string

## Step 1: Prepare the Server for Railway

The server needs a few adjustments for Railway deployment. Create a new file for Railway:

### Option A: Use the existing server.ts (Recommended)

Railway can run the server directly. Make sure your `package.json` has the right scripts.

## Step 2: Create Railway Project

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** (recommended) or **"Empty Project"**

## Step 3: Configure the Deployment

### If deploying from GitHub:

1. Connect your GitHub repository
2. Railway will auto-detect it's a Node.js project
3. Go to your service → **Settings** → **Deploy**

### Configure Start Command:

In Railway dashboard:
1. Go to your service
2. Click **Settings** tab
3. Scroll to **Deploy** section
4. Set **Start Command** to: `tsx server.ts`
5. Railway will automatically use `pnpm install` (or `npm install`)

**Note**: The `railway.json` file is already configured, but you can override in the dashboard if needed.

## Step 4: Set Environment Variables

In Railway, go to **Variables** tab and add:

### Required Variables:

```
NODE_ENV=production
```

**Note**: Railway automatically sets `PORT` - don't override it!

### Database:
```
DATABASE_URL=your-postgresql-connection-string
```

### NextAuth (same as your main app):
```
NEXTAUTH_URL=https://your-main-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-same-as-main-app
```

### CORS (for WebSocket):
```
CORS_ORIGIN=https://your-main-app.vercel.app
```

**Note**: If `CORS_ORIGIN` is not set, it will use `NEXTAUTH_URL` as fallback.

### Important Notes:
- Railway automatically provides `PORT` - don't set it manually
- `HOSTNAME` is optional (defaults to `0.0.0.0` which works on Railway)

## Step 5: Update Your Main App

Once Railway deploys your server, you'll get a URL like:
```
https://your-project.railway.app
```

### Update Vercel Environment Variables:

1. Go to your Vercel project settings
2. Add/Update:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-project.railway.app
   ```
3. Redeploy your Vercel app

## Step 6: Verify Deployment

1. Check Railway logs to ensure the server started
2. Visit `https://your-project.railway.app` - you should see "Ready on http://..."
3. Test WebSocket connection from your main app

## Troubleshooting

### Server won't start
- Check Railway logs for errors
- Ensure `DATABASE_URL` is set correctly
- Verify `PORT` environment variable (Railway sets this automatically)

### WebSocket connection fails
- Check CORS settings in `lib/socket/server.ts`
- Ensure `NEXT_PUBLIC_SOCKET_URL` matches Railway URL
- Verify the server is running (check Railway logs)

### Build fails
- Ensure `tsx` is in dependencies (not just devDependencies) for Railway
- Or use the compiled version with `build:server` script

## Alternative: Use Railway's Node.js Template

1. Create new project → **"Deploy from GitHub repo"**
2. Select your repository
3. Railway will auto-detect Node.js
4. Set environment variables
5. Update start command to: `tsx server.ts` or `node dist/server.js`

## Cost Considerations

- Railway offers a free tier with $5 credit/month
- After free tier, pricing is usage-based
- Consider using Railway only for the WebSocket server (smaller footprint)

## Security Notes

- Keep `NEXTAUTH_SECRET` the same between main app and server
- Use HTTPS URLs for production
- Consider adding rate limiting for WebSocket connections

