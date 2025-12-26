# Complete Railway Setup Guide for server.ts

## The Problem
Railway shows "deployed complete" but you can't make requests. This usually means Railway is running Next.js's default server instead of your custom `server.ts`.

## Step-by-Step Setup

### Step 1: Verify Railway Configuration

1. **Go to Railway Dashboard**:
   - Navigate to your service
   - Click **Settings** tab
   - Scroll to **Deploy** section

2. **Check Start Command**:
   - It MUST be: `tsx server.ts`
   - If it says `next start` or `npm start`, change it to `tsx server.ts`
   - Click **Save**

3. **Verify Build Command**:
   - Should be: `pnpm install && pnpm build` (or leave default)
   - Railway will auto-detect from `railway.json`

### Step 2: Check Environment Variables

Go to **Variables** tab and ensure these are set:

```
NODE_ENV=production
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_URL=https://your-main-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
CORS_ORIGIN=https://your-main-app.vercel.app (optional)
```

**Important**: Railway automatically sets `PORT` - don't override it!

### Step 3: Check Deploy Logs

1. Go to **Deploy Logs** tab (NOT Build Logs)
2. Look for these messages:
   ```
   > WebSocket server ready on http://0.0.0.0:PORT
   > Socket.io path: /api/socket
   > Environment: production
   > PORT: XXXX, HOSTNAME: 0.0.0.0
   ```

3. **If you DON'T see these messages**:
   - The custom server isn't starting
   - Railway is probably using Next.js default server
   - Check the start command in Settings

### Step 4: Verify Service Type

1. Go to **Settings** → **General**
2. Make sure service type is **"Web Service"** (not Static Site)
3. If it's wrong, you may need to recreate the service

### Step 5: Test the Health Endpoint

After deployment, test:
```
https://your-service.railway.app/api/health
```

Should return:
```json
{"status":"ok","service":"unirumble"}
```

If this works, your server is running correctly.

### Step 6: Check HTTP Logs

1. Go to **HTTP Logs** tab
2. Try accessing your Railway URL
3. You should see requests with status 200 (not 502)

## Common Issues & Fixes

### Issue 1: Railway Using Next.js Default Server

**Symptoms**: 
- Deploy logs show "Next.js ready" instead of "WebSocket server ready"
- Can't access `/api/socket/`

**Fix**:
1. Go to Settings → Deploy
2. Set Start Command to: `tsx server.ts`
3. Save and redeploy

### Issue 2: Server Crashes After Startup

**Symptoms**:
- Deploy logs show server starting, then nothing
- HTTP logs show 502 errors

**Fix**:
1. Check Deploy Logs for error messages
2. Common causes:
   - Missing `DATABASE_URL`
   - Missing `NEXTAUTH_SECRET`
   - Database connection failure
3. Fix the error and redeploy

### Issue 3: Health Check Failing

**Symptoms**:
- Railway shows "Application failed to respond"
- Health endpoint returns 502

**Fix**:
1. The health check is already configured in `railway.json`
2. Make sure `/api/health` endpoint works (test it directly)
3. Check Deploy Logs to see if server is actually running

### Issue 4: Port Mismatch

**Symptoms**:
- Server starts but Railway can't reach it

**Fix**:
- Railway automatically sets `PORT` environment variable
- Your server already uses `process.env.PORT`
- Don't manually set PORT in Railway variables

## Verification Checklist

After setup, verify:

- [ ] Start Command is `tsx server.ts` in Railway Settings
- [ ] Deploy Logs show "WebSocket server ready" message
- [ ] `/api/health` endpoint returns `{"status":"ok"}`
- [ ] HTTP Logs show 200 status codes (not 502)
- [ ] All environment variables are set
- [ ] Service type is "Web Service"

## Quick Test Commands

Test from your local machine:

```bash
# Test health endpoint
curl https://your-service.railway.app/api/health

# Test root endpoint
curl https://your-service.railway.app/

# Test WebSocket endpoint (should return something, not 502)
curl https://your-service.railway.app/api/socket/
```

## If Still Not Working

1. **Check Railway Service Type**:
   - Must be "Web Service"
   - If it's "Static Site", recreate the service

2. **Verify Start Command**:
   - Railway dashboard → Settings → Deploy
   - Must be exactly: `tsx server.ts`

3. **Check for Errors**:
   - Deploy Logs tab for startup errors
   - HTTP Logs tab for request errors

4. **Try Compiled Version**:
   - Change start command to: `node dist/server.js`
   - Make sure `build:server` runs during build
   - Update `railway.json` build command to include `pnpm build:server`

5. **Contact Railway Support**:
   - If everything looks correct but still not working
   - Share your Deploy Logs with them

