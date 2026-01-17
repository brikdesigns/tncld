# Figma Integration Setup Guide

This guide will help you set up the complete Figma → GitHub → Webflow integration for your project.

> **Security First:** Never hardcode API tokens in documentation or code files.
> See [API-KEY-SECURITY.md](API-KEY-SECURITY.md) for secure key management.

---

## Overview

The integration provides:
- **Figma to GitHub**: Automatic sync of design tokens from multiple files
- **Figma to Webflow**: Direct plugin integration
- **GitHub to Webflow**: Automated deployment

---

## Prerequisites

- [ ] Figma account with personal access token (see Step 1)
- [ ] GitHub repository
- [ ] Webflow account
- [ ] Node.js installed
- [ ] macOS Keychain configured (see [API-KEY-SECURITY.md](API-KEY-SECURITY.md))

---

## Step 1: Get Your API Credentials

### Figma Access Token

1. Go to https://www.figma.com/settings
2. Scroll to **Personal access tokens**
3. Click **Generate new token**
4. Copy the token (starts with `figd_`)

### Figma File Keys

1. Open your Figma file
2. Copy the URL: `https://www.figma.com/design/abc123def456/My-Design`
3. The file key is `abc123def456`
4. For multiple files, note each key separately

### Webflow Credentials

1. Go to your Webflow site → **Settings** → **Integrations** → **API Access**
2. Generate an API token
3. Note your Site ID from the URL or site settings

---

## Step 2: Store Credentials Securely

### Option A: macOS Keychain (Recommended)

Run the setup script:

```bash
bash ~/.config/setup-brik-secrets.sh
```

Or add manually:

```bash
# Figma
security add-generic-password -a "$USER" -s "FIGMA_TOKEN" -w "[YOUR_FIGMA_TOKEN]"
security add-generic-password -a "$USER" -s "FIGMA_FILE_KEYS" -w "[KEY1,KEY2,KEY3]"

# Webflow
security add-generic-password -a "$USER" -s "WEBFLOW_TOKEN" -w "[YOUR_WEBFLOW_TOKEN]"
security add-generic-password -a "$USER" -s "WEBFLOW_SITE_ID" -w "[YOUR_SITE_ID]"
```

### Option B: Local .env File

```bash
cp .env.example .env
# Edit .env with your credentials
```

> **Warning:** Never commit `.env` files to git.

---

## Step 3: GitHub Secrets Setup

For CI/CD workflows, add secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `FIGMA_ACCESS_TOKEN` | Your Figma token |
| `FIGMA_FILE_KEYS` | Comma-separated file keys |
| `WEBFLOW_API_TOKEN` | Your Webflow token |
| `WEBFLOW_SITE_ID` | Your Webflow site ID |

---

## Step 4: Install Figma Plugins

### Figma to Webflow Plugin

1. Go to [webflow.com/figma-to-webflow](https://webflow.com/figma-to-webflow)
2. Click **"Install plugin"**
3. In Figma: **Plugins** → **Figma to Webflow**
4. Authorize your Webflow account

### Tokens Studio Plugin (Optional)

1. Install [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/Tokens-Studio-for-Figma)
2. In the plugin: **Settings** → **Sync**
3. Configure GitHub sync:
   - Repository: `[your-org]/[your-repo]`
   - Branch: `main`
   - Path: `design-tokens`
   - Token: Use your Figma access token

---

## Step 5: Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/[your-org]/[your-repo].git
   cd [your-repo]
   npm install
   ```

2. **Verify environment** (if using Keychain):
   ```bash
   echo $FIGMA_ACCESS_TOKEN  # Should show your token
   ```

3. **Test the sync**:
   ```bash
   npm run sync-figma
   npm run transform-tokens
   ```

---

## Workflow Usage

### Automatic Sync (Recommended)
- Design tokens sync automatically daily at 9 AM UTC
- Changes create pull requests for review
- Merged changes trigger Webflow deployment

### Manual Sync
```bash
# Sync Figma designs to tokens
npm run sync-figma

# Transform tokens to CSS
npm run transform-tokens

# Do both
npm run sync-and-transform
```

### GitHub Actions Manual Trigger
1. Go to **Actions** tab in your repository
2. Select **"Sync Figma Designs"** workflow
3. Click **"Run workflow"**

---

## File Structure

```
project/
├── design-tokens/          # Auto-synced from Figma
│   ├── tokens.json         # Combined design tokens
│   └── metadata.json       # File metadata
├── css/
│   └── design-tokens.css   # Auto-generated CSS variables
├── scripts/
│   ├── sync-figma.js       # Figma sync script
│   └── transform-tokens.js # Token transformer
├── .env.example            # Template (safe to commit)
├── .env                    # Your credentials (NEVER commit)
└── .github/workflows/
    └── figma-sync.yml      # GitHub Actions workflow
```

---

## Using Design Tokens in Webflow

### CSS Variables

The sync creates CSS variables you can use in Webflow:

```css
/* Colors */
--color-primary: #007bff;
--color-secondary: #6c757d;

/* Typography */
--font-heading-family: "Arial, sans-serif";
--font-heading-size: 24px;
--font-body-family: "Helvetica, sans-serif";
--font-body-size: 16px;
```

### Utility Classes
```css
.color-primary { color: var(--color-primary); }
.bg-primary { background-color: var(--color-primary); }
```

---

## Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| "No Figma file keys provided" | Check `FIGMA_FILE_KEYS` in env/secrets |
| "Authentication failed" | Verify token is correct and not expired |
| "No design tokens found" | Run `npm run sync-figma` first |
| GitHub Actions failing | Check Actions tab for details |

### Debug Commands

```bash
# Check if environment variables are set
echo $FIGMA_ACCESS_TOKEN

# Check if tokens exist
ls -la design-tokens/

# View token content
cat design-tokens/tokens.json

# Test sync locally (uses Keychain env vars)
npm run sync-figma
```

---

## Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma to Webflow Plugin](https://webflow.com/figma-to-webflow)
- [Tokens Studio Documentation](https://docs.tokens.studio/)
- [Webflow API Documentation](https://developers.webflow.com/)
- [API Key Security Guide](API-KEY-SECURITY.md)

---

## New Client Setup Checklist

- [ ] 1. Create Figma access token
- [ ] 2. Note Figma file keys for project
- [ ] 3. Create Webflow API token
- [ ] 4. Store all credentials in Keychain (`bash ~/.config/setup-brik-secrets.sh`)
- [ ] 5. Add secrets to GitHub repository
- [ ] 6. Install Figma plugins
- [ ] 7. Test local sync: `npm run sync-figma`
- [ ] 8. Verify GitHub Actions workflow

---

**Last updated**: January 2025
