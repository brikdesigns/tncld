# Notion ↔ Webflow Content Audit & Sync Workflow

## Overview

This workflow enables cross-checking content between Notion (source of truth for content planning) and Webflow (live site). It identifies missing content, UI elements, or page sections and provides options for direct updates.

---

## Prerequisites

### MCP Servers Required

| Server | Purpose | Setup Command |
|--------|---------|---------------|
| **Notion MCP** | Read/write Notion pages & databases | `claude mcp add --transport stdio notion -s local --env NOTION_TOKEN=xxx -- npx -y @notionhq/notion-mcp-server` |
| **Webflow MCP** | Read/write Webflow pages & CMS | `claude mcp add --transport http webflow -s local https://mcp.webflow.com/mcp` |

### Notion Setup
- Integration token with access to content databases
- Content structured in databases or pages
- Clear naming conventions matching Webflow pages

---

## Quick Reference

| Task | Best Approach | MCP Tools Used |
|------|---------------|----------------|
| **Content audit** | Compare both sources | Notion + Webflow read |
| **Add missing content** | Direct to Webflow | Webflow MCP write |
| **Update CMS items** | Direct to Webflow | `data_cms_tool` |
| **Update page content** | Direct to Webflow | `data_pages_tool` |
| **Bulk content migration** | Notion → Webflow | Both MCPs |

---

## Workflow 1: Content Audit (Read-Only)

### When to Use
- Before launch to verify all content is in place
- After content updates in Notion
- Regular QA checks

### Quick Commands

```
"Compare Notion content with Webflow for [page name]"
"Audit all service pages - check Notion vs Webflow"
"Find missing content on Webflow that exists in Notion"
"Generate a content gap report"
```

### Process

1. **Pull Notion Content**
   ```
   Notion MCP → API-post-search → Find content database
   Notion MCP → API-get-block-children → Get page content
   ```

2. **Pull Webflow Content**
   ```
   Webflow MCP → data_pages_tool > get_page_content
   Webflow MCP → data_cms_tool > list_collection_items
   ```

3. **Compare & Report**
   - Match by page name/slug
   - Identify missing sections
   - Flag outdated content
   - Note formatting differences

### Output: Gap Report

```markdown
## Content Audit Report - [Project Name]
**Date:** 2026-01-16

### Missing in Webflow
- [ ] About page - Team section (exists in Notion)
- [ ] Services - "Teeth Whitening" service details
- [ ] FAQ - 5 new questions added to Notion

### Outdated in Webflow
- [ ] Contact page - Phone number changed
- [ ] Pricing - Old prices still showing

### Missing in Notion (document for future)
- [ ] Privacy Policy - only in Webflow
```

---

## Workflow 2: Direct Webflow Updates (Recommended)

### When to Use
- Quick content fixes
- Adding missing CMS items
- Updating text without local testing needed

### Quick Commands

```
"Update the About page in Webflow with content from Notion"
"Add missing FAQ items from Notion to Webflow CMS"
"Sync all service descriptions from Notion to Webflow"
"Update contact info on Webflow to match Notion"
```

### CMS Item Updates

**Add new CMS item:**
```
Webflow MCP → data_cms_tool > create_collection_items
{
  "collection_id": "xxx",
  "request": {
    "fieldData": [
      { "name": "Service Name", "slug": "service-name" }
    ]
  }
}
```

**Update existing CMS item:**
```
Webflow MCP → data_cms_tool > update_collection_items
{
  "collection_id": "xxx",
  "request": {
    "items": [
      { "id": "item-id", "fieldData": { "name": "Updated Name" } }
    ]
  }
}
```

**Publish CMS changes:**
```
Webflow MCP → data_cms_tool > publish_collection_items
```

### Static Page Updates

**Update page content (localized text):**
```
Webflow MCP → data_pages_tool > update_static_content
{
  "page_id": "xxx",
  "localeId": "xxx",
  "nodes": [
    { "nodeId": "xxx", "text": "<p>New content here</p>" }
  ]
}
```

---

## Workflow 3: Bulk Content Migration

### When to Use
- Initial site content population
- Major content overhauls
- Migrating from another CMS

### Quick Commands

```
"Migrate all blog posts from Notion to Webflow CMS"
"Bulk import services from Notion database to Webflow"
"Transfer FAQ database from Notion to Webflow collection"
```

### Process

1. **Export from Notion**
   ```
   Notion MCP → API-query-data-source → Get all items
   ```

2. **Map Fields**
   ```
   Notion Field     → Webflow Field
   ─────────────────────────────────
   Title            → Name
   Description      → Rich Text
   Image URL        → Image (requires asset upload)
   Category         → Reference/Option
   ```

3. **Import to Webflow**
   ```
   For each Notion item:
     → data_cms_tool > create_collection_items
   ```

4. **Publish All**
   ```
   data_cms_tool > publish_collection_items
   ```

---

## Workflow 4: Two-Way Sync Strategy

### Recommended Approach: Notion as Source of Truth

```
┌─────────────┐     Content      ┌─────────────┐
│   NOTION    │ ───────────────→ │   WEBFLOW   │
│  (Planning) │                  │   (Live)    │
└─────────────┘                  └─────────────┘
     ↑                                  │
     │         Status Updates           │
     └──────────────────────────────────┘
```

- **Notion:** Draft content, content calendar, approvals
- **Webflow:** Published content, live site
- **Sync Direction:** Notion → Webflow (one-way for content)
- **Feedback Loop:** Update Notion status after Webflow publish

### Status Tracking in Notion

Add a "Webflow Status" property to Notion databases:
- `Draft` - Not yet in Webflow
- `Pending` - Ready for Webflow
- `Published` - Live on Webflow
- `Outdated` - Webflow has newer version

---

## MCP Tool Reference

### Notion MCP Tools

| Tool | Purpose |
|------|---------|
| `API-post-search` | Find pages/databases by title |
| `API-get-block-children` | Get page content blocks |
| `API-query-data-source` | Query database items |
| `API-retrieve-a-page` | Get page properties |

### Webflow MCP Tools

| Tool | Purpose |
|------|---------|
| `data_pages_tool > list_pages` | List all site pages |
| `data_pages_tool > get_page_content` | Get page structure |
| `data_pages_tool > update_static_content` | Update text nodes |
| `data_cms_tool > get_collection_list` | List CMS collections |
| `data_cms_tool > list_collection_items` | Get CMS items |
| `data_cms_tool > create_collection_items` | Add new CMS items |
| `data_cms_tool > update_collection_items` | Update CMS items |
| `data_cms_tool > publish_collection_items` | Publish changes |

---

## Quick Commands Summary

```
# Audit Commands
"Compare Notion and Webflow content for this project"
"Find content missing from Webflow"
"Generate content gap report"
"List all CMS items in Webflow"

# Direct Update Commands
"Update Webflow page [name] with Notion content"
"Add this Notion content to Webflow CMS"
"Sync FAQ items from Notion to Webflow"
"Update contact info in Webflow"

# Bulk Operations
"Migrate Notion database [name] to Webflow collection [name]"
"Import all blog posts from Notion"
"Bulk update service descriptions"

# Status Commands
"Mark Notion items as published after Webflow sync"
"What Notion content is pending for Webflow?"
```

---

## Best Practices

### Content Structure
- Use consistent naming between Notion and Webflow
- Match database/collection field names where possible
- Include slugs in Notion for easy matching

### Before Syncing
- Always audit first (read-only) before making changes
- Backup Webflow content if doing bulk updates
- Test with single item before bulk operations

### After Syncing
- Verify changes in Webflow Designer
- Publish site to see live changes
- Update Notion status properties

---

## Troubleshooting

**"Can't find Notion database"**
- Ensure integration has access to the database
- Check database is shared with integration
- Use `API-post-search` to find by title

**"Webflow CMS field mismatch"**
- Verify field types match (text → text, etc.)
- Check required fields are populated
- Use `get_collection_details` to see schema

**"Content not appearing after sync"**
- CMS items need to be published
- Static content may need site publish
- Check if page is draft vs published

---

## Related Documentation

- [WEBFLOW-CUSTOM-CODE-TRANSFER.md](WEBFLOW-CUSTOM-CODE-TRANSFER.md) - Code transfer
- [GITHUB-WEBFLOW-SYNC.md](GITHUB-WEBFLOW-SYNC.md) - Git integration
- [GLOBAL-WEBFLOW-WORKFLOW.md](../GLOBAL-WEBFLOW-WORKFLOW.md) - Overall workflow

---

**Last Updated:** January 2026
**Maintained By:** Brik Designs
