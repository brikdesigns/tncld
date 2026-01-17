# API Key Security Guide

> Secure management of API tokens for Webflow client projects.

---

## The Problem

API keys hardcoded in source files get exposed when pushed to GitHub, even in private repos (if they later become public or are shared). This triggers security alerts from:
- GitHub Secret Scanning
- Figma, Google, Notion, and Webflow security teams

**Never commit API keys to version control.**

---

## Solution: macOS Keychain + Helper Script

Store keys in macOS Keychain (encrypted, persists across restarts) and auto-load them as environment variables.

### One-Time Setup

#### 1. Create the secrets loader

Create `~/.config/brik-secrets.sh`:

```bash
#!/bin/bash
# Brik API Secrets - Loaded from macOS Keychain

# Figma
export FIGMA_ACCESS_TOKEN=$(security find-generic-password -s "FIGMA_TOKEN" -w 2>/dev/null)
export FIGMA_FILE_KEYS=$(security find-generic-password -s "FIGMA_FILE_KEYS" -w 2>/dev/null)

# Notion
export NOTION_TOKEN=$(security find-generic-password -s "NOTION_TOKEN" -w 2>/dev/null)

# Webflow
export WEBFLOW_API_TOKEN=$(security find-generic-password -s "WEBFLOW_TOKEN" -w 2>/dev/null)
export WEBFLOW_SITE_ID=$(security find-generic-password -s "WEBFLOW_SITE_ID" -w 2>/dev/null)

# Google
export GOOGLE_MAPS_API_KEY=$(security find-generic-password -s "GOOGLE_MAPS_KEY" -w 2>/dev/null)
```

#### 2. Add to shell profile

Add to `~/.zshrc`:

```bash
# Brik API secrets from macOS Keychain
[ -f "$HOME/.config/brik-secrets.sh" ] && source "$HOME/.config/brik-secrets.sh"
```

#### 3. Store your keys in Keychain

```bash
# Figma
security add-generic-password -a "$USER" -s "FIGMA_TOKEN" -w "your_token_here"
security add-generic-password -a "$USER" -s "FIGMA_FILE_KEYS" -w "file_key_1,file_key_2"

# Notion
security add-generic-password -a "$USER" -s "NOTION_TOKEN" -w "ntn_your_token_here"

# Webflow
security add-generic-password -a "$USER" -s "WEBFLOW_TOKEN" -w "your_token_here"
security add-generic-password -a "$USER" -s "WEBFLOW_SITE_ID" -w "your_site_id_here"

# Google Maps
security add-generic-password -a "$USER" -s "GOOGLE_MAPS_KEY" -w "AIza_your_key_here"
```

#### 4. Verify

```bash
# Open new terminal, then:
echo $FIGMA_ACCESS_TOKEN
echo $NOTION_TOKEN
```

---

## Interactive Setup Script

For convenience, create `~/.config/setup-brik-secrets.sh`:

```bash
#!/bin/bash
# One-time setup script to add Brik secrets to macOS Keychain

echo "🔐 Brik Secrets Setup"
echo "===================="

add_secret() {
    local service=$1
    local prompt=$2

    if security find-generic-password -s "$service" -w &>/dev/null; then
        echo "✓ $service already exists in Keychain"
        read -p "  Replace it? (y/N): " replace
        if [[ "$replace" != "y" && "$replace" != "Y" ]]; then
            return
        fi
        security delete-generic-password -s "$service" &>/dev/null
    fi

    read -sp "$prompt: " value
    echo ""

    if [ -n "$value" ]; then
        security add-generic-password -a "$USER" -s "$service" -w "$value"
        echo "✓ $service saved to Keychain"
    else
        echo "⚠ Skipped $service (empty value)"
    fi
}

add_secret "FIGMA_TOKEN" "Figma Access Token"
add_secret "FIGMA_FILE_KEYS" "Figma File Keys (comma-separated)"
add_secret "NOTION_TOKEN" "Notion Integration Token"
add_secret "WEBFLOW_TOKEN" "Webflow API Token"
add_secret "WEBFLOW_SITE_ID" "Webflow Site ID"
add_secret "GOOGLE_MAPS_KEY" "Google Maps API Key"

echo ""
echo "✅ Setup complete! Run: source ~/.config/brik-secrets.sh"
```

Run with: `bash ~/.config/setup-brik-secrets.sh`

---

## Pre-commit Hooks (Prevent Accidental Commits)

Use `git-secrets` to automatically scan commits for API tokens before they can be pushed.

### One-Time Global Setup

```bash
# Install git-secrets
brew install git-secrets

# Set up global template (applies to all new repos)
mkdir -p ~/.git-templates/git-secrets
git secrets --install ~/.git-templates/git-secrets
git config --global init.templateDir ~/.git-templates/git-secrets

# Add patterns to detect common tokens
git secrets --add --global 'figd_[A-Za-z0-9_-]{20,}'      # Figma
git secrets --add --global 'ntn_[A-Za-z0-9_-]{20,}'       # Notion
git secrets --add --global 'AIzaSy[A-Za-z0-9_-]{30,}'     # Google

# Allow placeholder patterns (prevent false positives)
git secrets --add --global --allowed 'your_figma_token_here'
git secrets --add --global --allowed 'your_notion_token_here'
git secrets --add --global --allowed '\[YOUR_'
```

### Install in Existing Repos

```bash
cd /path/to/your/repo
git secrets --install
```

### How It Works

When you try to commit a file containing a pattern like `figd_ABC123...`, git-secrets will:
1. Block the commit
2. Show you which file and line contains the secret
3. Suggest how to proceed (fix, allow, or override)

### Test the Hook

```bash
# Create a test file with a fake token
echo "TOKEN=figd_TESTFAKE12345678901234567890" > /tmp/test.txt

# Scan it (should fail)
git secrets --scan /tmp/test.txt

# Clean up
rm /tmp/test.txt
```

---

## Project Setup

### Required Files

Every client project should have:

#### `.gitignore`

```gitignore
# Environment variables (secrets)
.env
.env.local
.env.*.local

# Node
node_modules/

# OS files
.DS_Store
```

#### `.env.example`

```bash
# Copy to .env and fill in values (for local dev without Keychain)
# NEVER commit .env to version control

# Figma API
FIGMA_ACCESS_TOKEN=your_figma_token_here
FIGMA_FILE_KEYS=file_key_1,file_key_2

# Notion API
NOTION_TOKEN=your_notion_token_here

# Webflow API
WEBFLOW_API_TOKEN=your_webflow_token_here
WEBFLOW_SITE_ID=your_site_id_here

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Using in Node.js Scripts

```javascript
require('dotenv').config();  // Falls back to .env if Keychain not set

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const WEBFLOW_TOKEN = process.env.WEBFLOW_API_TOKEN;
```

---

## Updating Keys

### View stored keys

```bash
# List all Brik-related keys
security dump-keychain | grep -A5 "FIGMA\|NOTION\|WEBFLOW\|GOOGLE_MAPS"
```

### Update a key

```bash
# Delete old
security delete-generic-password -s "FIGMA_TOKEN"

# Add new
security add-generic-password -a "$USER" -s "FIGMA_TOKEN" -w "new_token_here"
```

### Remove a key

```bash
security delete-generic-password -s "FIGMA_TOKEN"
```

---

## If Keys Get Exposed

If you accidentally commit API keys:

1. **Immediately revoke the exposed keys:**
   - Figma: https://www.figma.com/settings → Personal access tokens
   - Notion: https://www.notion.so/profile/integrations
   - Webflow: https://webflow.com/dashboard/workspace/integrations
   - Google: https://console.cloud.google.com/apis/credentials

2. **Generate new keys** and store in Keychain

3. **Clean git history** (optional, for sensitive repos):
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   # See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
   ```

---

## Alternative: 1Password CLI

For team environments, consider 1Password CLI:

```bash
# Install
brew install 1password-cli

# Use in scripts
export FIGMA_ACCESS_TOKEN=$(op read "op://Private/Figma/token")
```

---

## Quick Reference

| Service | Token URL | Env Variable |
|---------|-----------|--------------|
| Figma | https://www.figma.com/developers/api#access-tokens | `FIGMA_ACCESS_TOKEN` |
| Notion | https://www.notion.so/profile/integrations | `NOTION_TOKEN` |
| Webflow | Site Settings → Integrations → API Access | `WEBFLOW_API_TOKEN` |
| Google Maps | https://console.cloud.google.com/apis/credentials | `GOOGLE_MAPS_API_KEY` |
