# Figma Integration Setup Guide

This guide will help you set up the complete Figma → GitHub → Webflow integration for your project.

## 🎯 Overview

The integration provides:
- **Figma to GitHub**: Automatic sync of design tokens from multiple files
- **Figma to Webflow**: Direct plugin integration
- **GitHub to Webflow**: Automated deployment

## 📋 Prerequisites

- ✅ Figma account with personal access token: `REDACTED-figma-pat-brik-llm-3789`
- ✅ GitHub repository
- ✅ Webflow account
- ✅ Node.js installed

## 🔧 Step 1: GitHub Secrets Setup

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

### Required Secrets:
- **`FIGMA_ACCESS_TOKEN`**: `REDACTED-figma-pat-brik-llm-3789`
- **`FIGMA_FILE_KEYS`**: `7uPDq1zzZVoEdBe7PTauRS,Rkdc3SIWJUdgoAkeadgZZe` (comma-separated)
- **`WEBFLOW_API_TOKEN`**: Your Webflow API token
- **`WEBFLOW_SITE_ID`**: Your Webflow site ID

### How to get Figma File Keys:
1. Open your Figma file
2. Copy the URL: `https://www.figma.com/design/abc123def456/My-Design`
3. The file key is `abc123def456`
4. For multiple files, separate with commas: `key1,key2,key3`

### Current Files:
- **❖ Brik Brand Toolkit**: `7uPDq1zzZVoEdBe7PTauRS`
- **❖ Brik Foundations**: `Rkdc3SIWJUdgoAkeadgZZe`

## 🔧 Step 2: Install Figma to Webflow Plugin

1. Go to [https://webflow.com/figma-to-webflow](https://webflow.com/figma-to-webflow)
2. Click **"Install plugin"**
3. In Figma, go to **Plugins** → **Figma to Webflow**
4. Authorize your Webflow account
5. Select your Webflow site/workspace

## 🔧 Step 3: Install Tokens Studio Plugin (Optional)

1. Install [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/Tokens-Studio-for-Figma)
2. In the plugin, go to **Settings** → **Sync**
3. Configure GitHub sync:
   - Repository: `yourusername/brik-bds.webflow`
   - Branch: `main`
   - Path: `design-tokens`
   - Token: `REDACTED-figma-pat-brik-llm-3789`

## 🔧 Step 4: Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/yourusername/brik-bds.webflow.git
   cd brik-bds.webflow
   npm install
   ```

2. **Create environment file**:
   ```bash
   # Create .env file
   echo "FIGMA_ACCESS_TOKEN=REDACTED-figma-pat-brik-llm-3789" > .env
   echo "FIGMA_FILE_KEYS=7uPDq1zzZVoEdBe7PTauRS,Rkdc3SIWJUdgoAkeadgZZe" >> .env
   ```

3. **Test the sync**:
   ```bash
   npm run sync-figma
   npm run transform-tokens
   ```

## 🔄 Workflow Usage

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
4. Enter your Figma file keys (comma-separated)
5. Click **"Run workflow"**

## 📁 File Structure

```
brik-bds.webflow/
├── design-tokens/          # Auto-synced from Figma
│   ├── tokens.json         # Combined design tokens from all files
│   └── metadata.json       # File metadata for each Figma file
├── css/
│   └── design-tokens.css   # Auto-generated CSS variables
├── scripts/
│   ├── sync-figma.js       # Figma sync script (multi-file support)
│   └── transform-tokens.js # Token transformer
└── .github/workflows/
    └── figma-sync.yml      # GitHub Actions workflow
```

## 🎨 Using Design Tokens in Webflow

### CSS Variables
The sync creates CSS variables you can use in Webflow:

```css
/* Colors from Brik Brand Toolkit */
--color_brik_brand_toolkit_primary: #007bff;
--color_brik_brand_toolkit_secondary: #6c757d;

/* Colors from Brik Foundations */
--color_brik_foundations_primary: #28a745;
--color_brik_foundations_secondary: #ffc107;

/* Typography from Brik Brand Toolkit */
--font_brik_brand_toolkit_heading-family: "Arial, sans-serif";
--font_brik_brand_toolkit_heading-size: 24px;

/* Typography from Brik Foundations */
--font_brik_foundations_body-family: "Helvetica, sans-serif";
--font_brik_foundations_body-size: 16px;
```

### Utility Classes
```css
.color-brik-brand-toolkit-primary { color: var(--color_brik_brand_toolkit_primary); }
.bg-brik-foundations-primary { background-color: var(--color_brik_foundations_primary); }
```

## 🔍 Troubleshooting

### Common Issues:

1. **"No Figma file keys provided"**
   - Check that `FIGMA_FILE_KEYS` secret is set in GitHub
   - Verify the file keys in your Figma URLs

2. **"Authentication failed"**
   - Verify your Figma access token is correct
   - Check token permissions in Figma settings

3. **"No design tokens found"**
   - Run `npm run sync-figma` first
   - Check that your Figma files have design elements

4. **GitHub Actions failing**
   - Check the Actions tab for error details
   - Verify all secrets are set correctly

### Debug Commands:
```bash
# Check if tokens exist
ls -la design-tokens/

# View token content
cat design-tokens/tokens.json

# Test sync locally
FIGMA_ACCESS_TOKEN=REDACTED-figma-pat-brik-llm-3789 FIGMA_FILE_KEYS=7uPDq1zzZVoEdBe7PTauRS,Rkdc3SIWJUdgoAkeadgZZe npm run sync-figma
```

## 📚 Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma to Webflow Plugin](https://webflow.com/figma-to-webflow)
- [Tokens Studio Documentation](https://docs.tokens.studio/)
- [Official Figma GitHub Actions Example](https://github.com/figma/variables-github-action-example)
- [Webflow API Documentation](https://developers.webflow.com/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Verify all secrets are set correctly
4. Test the sync locally first

---

**Last updated**: January 2025 