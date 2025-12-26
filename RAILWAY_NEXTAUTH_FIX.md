# Fixing NEXTAUTH_SECRET Error on Railway

If you're getting "NEXTAUTH_SECRET is required" error even though you've set it in Railway, follow these steps:

## Issue
Railway might not expose environment variables during the **build phase**, even if they're set in the Variables tab. Next.js tries to evaluate the auth route during build, which can cause this error.

## Solution Steps

### 1. Verify Variable is Set Correctly
- Go to Railway → Your Service → **Variables** tab
- Make sure `NEXTAUTH_SECRET` is listed (not just `NEXTAUTH_URL`)
- Check that the value is not empty
- **Important**: Variable name must be exactly `NEXTAUTH_SECRET` (case-sensitive)

### 2. Redeploy After Setting Variables
After adding/updating environment variables:
1. Go to Railway → Your Service → **Deployments** tab
2. Click **"Redeploy"** or trigger a new deployment
3. Railway will rebuild with the new environment variables

### 3. Check Build Logs
- Go to Railway → Your Service → **Deployments**
- Click on the failed deployment
- Check the build logs to see if `NEXTAUTH_SECRET` is available
- Look for any warnings about missing environment variables

### 4. Alternative: Set Variable Before First Deploy
If you're setting up a new service:
1. **First**: Add all environment variables in Railway
2. **Then**: Connect your GitHub repo or deploy
3. This ensures variables are available from the first build

### 5. Verify Variable is Available
Add a temporary debug line in `lib/auth.ts` to check if the variable is available:

```typescript
console.log('NEXTAUTH_SECRET during build:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
```

Check Railway build logs to see if it's available during build.

## Current Code Behavior

The code has been updated to:
- ✅ Never throw errors during build phase
- ✅ Use a placeholder secret during build if variable isn't available
- ✅ Validate the secret only at runtime (when handling actual requests)

This means:
- **Build will succeed** even if `NEXTAUTH_SECRET` isn't available during build
- **Runtime will fail** if `NEXTAUTH_SECRET` isn't set when handling requests
- You'll see an error when users try to sign in, not during build

## If Build Still Fails

If the build is still failing after these steps:

1. **Check Railway Build Settings**:
   - Go to Settings → Deploy
   - Ensure build command has access to environment variables
   - Some platforms require explicit configuration

2. **Use Railway's Raw Editor**:
   - Go to Variables tab → Click "Raw Editor"
   - Verify the JSON format is correct:
     ```json
     {
       "NEXTAUTH_SECRET": "your-secret-here",
       "NEXTAUTH_URL": "https://your-app.vercel.app",
       "DATABASE_URL": "your-db-url"
     }
     ```

3. **Check for Sealed Variables**:
   - Railway has "sealed" variables that are encrypted
   - Make sure `NEXTAUTH_SECRET` is not sealed if you need it during build

4. **Contact Railway Support**:
   - If variables are set but not available during build, this might be a Railway platform issue
   - Check Railway's documentation or support channels

## Expected Behavior After Fix

Once the variable is properly set and available:
- ✅ Build completes successfully
- ✅ App starts without errors
- ✅ Authentication works correctly
- ✅ No runtime errors about missing secret

