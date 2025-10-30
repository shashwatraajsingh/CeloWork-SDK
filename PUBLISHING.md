# Publishing CeloWork SDK to npm

## 📋 Pre-Publishing Checklist

Before publishing to npm, ensure:

- ✅ Package.json updated with correct version (1.0.0)
- ✅ README.md is complete and accurate
- ✅ LICENSE file exists
- ✅ Code is built and tested
- ✅ .npmignore configured correctly
- ✅ GitHub repository is public (if specified)

---

## 🚀 Step-by-Step Publishing Guide

### Step 1: Create npm Account (If you don't have one)

1. Go to https://www.npmjs.com/signup
2. Create an account
3. Verify your email address

### Step 2: Login to npm via CLI

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

### Step 3: Build the SDK

```bash
# Make sure you're in the root directory
cd /home/shashwat/Desktop/CeloWork\ SDK

# Build the TypeScript code
npm run build
```

This will compile your TypeScript files to the `dist/` folder.

### Step 4: Test the Package Locally (Optional but Recommended)

```bash
# Create a test package
npm pack

# This creates celowork-sdk-1.0.0.tgz
# You can test install it in another project:
# npm install /path/to/celowork-sdk-1.0.0.tgz
```

### Step 5: Publish to npm

```bash
# Publish the package
npm publish
```

If this is your first time publishing, you might need to verify your email first.

### Step 6: Verify Publication

1. Go to https://www.npmjs.com/package/celowork-sdk
2. Check that your package appears
3. Verify the README displays correctly
4. Check the version number

---

## 📦 What Gets Published

Based on your `package.json` "files" field, npm will include:

- ✅ `dist/` - Compiled JavaScript and TypeScript definitions
- ✅ `README.md` - Package documentation
- ✅ `LICENSE` - MIT license file
- ✅ `package.json` - Package metadata

**Excluded** (via `.npmignore`):
- ❌ `contracts/` - Smart contract source
- ❌ `demo/` - Demo applications
- ❌ `docs/` - Additional documentation
- ❌ `sdk/` - TypeScript source files
- ❌ `.env` files - Environment variables
- ❌ Test files

---

## 🔄 Publishing Updates

### For Bug Fixes (Patch Version)

```bash
# Increment patch version (1.0.0 -> 1.0.1)
npm version patch

# Publish
npm publish
```

### For New Features (Minor Version)

```bash
# Increment minor version (1.0.0 -> 1.1.0)
npm version minor

# Publish
npm publish
```

### For Breaking Changes (Major Version)

```bash
# Increment major version (1.0.0 -> 2.0.0)
npm version major

# Publish
npm publish
```

---

## 🎯 After Publishing

### Update Documentation

Update installation instructions in:
- README.md
- HOW-TO-USE.md
- docs/how-to-use-sdk.md

Change from:
```bash
npm install git+https://github.com/shashwatraajsingh/celowork-sdk.git
```

To:
```bash
npm install celowork-sdk
```

### Announce Your Package

Share on:
- Twitter/X
- Reddit (r/celo, r/cryptocurrency)
- Celo Discord
- Dev.to or Medium (write a blog post)
- GitHub Discussions

### Create a Release on GitHub

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: "CeloWork SDK v1.0.0 - Initial Release"
5. Description: Highlight key features
6. Attach the deployment details

---

## 🔐 Security Considerations

### Enable 2FA on npm

```bash
npm profile enable-2fa auth-and-writes
```

This requires a one-time password for:
- Login
- Publishing packages
- Changing settings

### Use Access Tokens for CI/CD

If you want to automate publishing:

1. Create an access token: https://www.npmjs.com/settings/~/tokens
2. Store it securely (GitHub Secrets, etc.)
3. Use in CI/CD pipelines

---

## 📊 Package Stats

After publishing, you can track:

- **Downloads**: https://www.npmjs.com/package/celowork-sdk
- **npm trends**: https://npmtrends.com/celowork-sdk
- **Bundle size**: https://bundlephobia.com/package/celowork-sdk

---

## 🐛 Troubleshooting

### "You do not have permission to publish"

- Make sure you're logged in: `npm whoami`
- Check package name isn't taken: https://www.npmjs.com/package/celowork-sdk
- If taken, change the name in package.json

### "Package name too similar to existing package"

- Choose a more unique name
- Consider scoped packages: `@your-username/celowork-sdk`

### "Missing README"

- Ensure README.md exists in root directory
- Check it's not excluded in .npmignore

### "Build files missing"

- Run `npm run build` before publishing
- Check `dist/` folder exists and contains files

---

## 📝 Scoped Package (Alternative)

If "celowork-sdk" is taken, use a scoped package:

```json
{
  "name": "@shashwatraajsingh/celowork-sdk",
  "version": "1.0.0"
}
```

Then publish with:
```bash
npm publish --access public
```

Users install with:
```bash
npm install @shashwatraajsingh/celowork-sdk
```

---

## ✅ Quick Command Reference

```bash
# Login to npm
npm login

# Build the package
npm run build

# Test package contents
npm pack

# Publish to npm
npm publish

# Check who you're logged in as
npm whoami

# View package info
npm view celowork-sdk

# Unpublish (within 72 hours, use carefully!)
npm unpublish celowork-sdk@1.0.0
```

---

## 🎉 Success!

Once published, developers worldwide can install your SDK with:

```bash
npm install celowork-sdk
```

And start building decentralized freelance marketplaces on Celo! 🚀

---

## 📞 Support

If you encounter issues:
- npm support: https://www.npmjs.com/support
- npm documentation: https://docs.npmjs.com/
- Check npm status: https://status.npmjs.org/
