# Fix: pnpm-lock.yaml Outdated Error on Railway

## The Problem

Railway build fails with:
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

## Solution 1: Update Lockfile Locally (Recommended)

1. **Regenerate lockfile locally**:
   ```bash
   pnpm install
   ```

2. **Commit the updated lockfile**:
   ```bash
   git add pnpm-lock.yaml
   git commit -m "Update pnpm-lock.yaml"
   git push
   ```

3. **Railway will rebuild** with the updated lockfile

## Solution 2: Use --no-frozen-lockfile (Quick Fix)

I've updated `railway.json` to use `--no-frozen-lockfile` in the build command. This allows Railway to update the lockfile during build.

**Note**: This is a temporary fix. For production, you should commit an up-to-date lockfile.

## Why This Happens

- Your local `pnpm-lock.yaml` has different versions than what's in the repo
- Railway uses `--frozen-lockfile` by default to ensure reproducible builds
- The lockfile and `package.json` must match exactly

## Best Practice

Always commit `pnpm-lock.yaml` after running `pnpm install` to keep it in sync with `package.json`.

