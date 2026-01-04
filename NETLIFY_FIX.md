# Netlify Deployment Fix

## Changes Made

To fix the Netlify deployment error, I've addressed two issues: Node version compatibility and pnpm activation on Netlify.

### 1. Created `.nvmrc` file

- Pins Node version to 20.9.0, which meets Next.js 16.x minimum requirement

### 2. Updated `package.json`

- Added `engines` field to specify Node >= 20.9.0:

```json
"engines": {
  "node": ">=20.9.0"
}
```

- Added `preinstall` script to activate Corepack and prepare pnpm:

```json
"scripts": {
  "preinstall": "corepack enable && corepack prepare pnpm@latest --activate",
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Why this is needed:** Netlify may not automatically detect and activate pnpm even with `pnpm-lock.yaml` committed. The `preinstall` script ensures Corepack is enabled and pnpm is activated before dependency installation begins.

### 3. Created `netlify.toml` configuration

- Explicitly sets Node version to 20.9.0 for Netlify builds
- Configures build command as `pnpm build`
- Sets publish directory to `.next`
- Enables Corepack and adds npm flags for compatibility:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20.9.0"
  NPM_FLAGS = "--legacy-peer-deps"
  COREPACK_ENABLE = "1"
```

**Why these settings are needed:**

- `COREPACK_ENABLE = "1"`: Ensures Corepack is available during the build
- `NPM_FLAGS = "--legacy-peer-deps"`: Helps avoid peer dependency conflicts during installation

## Next Steps

### Commit and push these changes

```bash
git add .nvmrc package.json netlify.toml NETLIFY_FIX.md
git commit -m "fix: enable pnpm on Netlify and pin Node to 20.9.0

- Add preinstall script to activate Corepack and pnpm
- Enable COREPACK in netlify.toml environment
- Add NPM_FLAGS for peer dependency compatibility"
git push
```

### Verify the build locally (optional but recommended)

```bash
nvm install 20.9.0
nvm use 20.9.0
pnpm install
pnpm build
```

### Monitor the Netlify deployment

After pushing, check the Netlify deployment logs to ensure:

1. Node 20.9.0 is being used instead of Node 18 or 22
2. The build completes successfully
3. No new errors appear

## Why Node 20.9.0?

Next.js 16.x requires Node.js >= 20.9.0 as a minimum requirement. Node 20.x is:

- The minimum version required by Next.js 16.x
- A stable LTS (Long Term Support) version
- Better supported by modern Next.js features
- Recommended for production builds with Next.js 16.x

## If Issues Persist

If the deployment still fails after these changes, please provide:

1. The full build log from Netlify (especially lines after "Computing checksum with sha256sum")
2. Any error messages that appear (look for "ERR!", "error", "failed", or stack traces)
3. The last 50-100 lines of the build output

### Common remaining issues and their fixes

**Issue: "command not found: pnpm"**

- The `preinstall` script should fix this. If it persists, try adding this to `netlify.toml`:

  ```toml
  [build.environment]
    NETLIFY_USE_PNPM = "true"
  ```

**Issue: "missing script: build"**

- Verify package.json has the build script (it should be there)
- Ensure package.json is committed to the repo

**Issue: Dependency installation errors**

- Check if any dependencies need to be moved from devDependencies to dependencies
- The `NPM_FLAGS = "--legacy-peer-deps"` should help with peer dependency conflicts

**Issue: Prisma errors during build**

- Ensure DATABASE_URL is set in Netlify environment variables
- Prisma migrations may need to run during build (add to build command if needed)
