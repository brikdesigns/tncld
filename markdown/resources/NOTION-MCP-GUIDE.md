# Notion MCP Integration Guide

This guide documents learnings from using Claude Code with Notion MCP for content management tasks.

---

## Quick Reference

### Getting Database/Page IDs from URLs

Notion URLs contain IDs that need extraction:

```
https://www.notion.so/workspace/Page-Name-1f797d34ed2881629c60000bcae32c74

Database ID: 1f797d34-ed28-8162-9c60-000bcae32c74
            ^^^^^^^^ ^^^^ ^^^^ ^^^^ ^^^^^^^^^^^^
            (insert hyphens at positions 8, 12, 16, 20)
```

**URL to UUID conversion:**
1. Take the 32-character hex string from the URL
2. Insert hyphens: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Providing Context to Claude

**Best Practice:** Always provide:
1. **Database URL** - Claude can extract the ID
2. **Database name/purpose** - helps identify the right one
3. **Property names** (if known) - prevents schema lookup errors

**Example prompt:**
```
The TNCLD website content is in this Notion database:
https://www.notion.so/brikdesigns/TNCLD-Website-1f797d34ed2881629c60000bcae32c74

Properties include: Name, Level, Level 1 Page (relation), Slug, Status
```

---

## Common Operations

### 1. Get Database Schema

Before querying, always retrieve the schema to understand property names:

```
mcp__notion__API-retrieve-a-data-source
  data_source_id: "1f797d34-ed28-8162-9c60-000bcae32c74"
```

This returns all properties with their exact names and types.

### 2. Query Database with Filters

**Important:** Property names are case-sensitive and must match exactly.

```
mcp__notion__API-query-data-source
  data_source_id: "database-uuid"
  filter: {
    "property": "Level",
    "select": {
      "equals": "Level 2"
    }
  }
```

### 3. Get Page Content (Block Children)

```
mcp__notion__API-get-block-children
  block_id: "page-uuid"
  page_size: 100
```

**Large Responses:** If content exceeds token limits, the tool saves results to a file. Use bash/jq to extract:

```bash
cat [saved-file.txt] | jq -r '.[0].text' | jq -r '.results[] | select(.type == "divider" or (.type | startswith("heading"))) | "\(.id)|\(.type)"'
```

### 4. Append Content to Page

Use `after` parameter to insert content at specific positions:

```
mcp__notion__API-patch-block-children
  block_id: "page-uuid"
  after: "block-uuid-to-insert-after"
  children: [block-objects]
```

---

## Block Types Reference

### Callout Block (Design Annotations)

```json
{
  "type": "callout",
  "callout": {
    "rich_text": [{
      "type": "text",
      "text": {
        "content": "Section: Hero; Layout: 2-col; Element: image, button;"
      }
    }],
    "icon": {
      "type": "emoji",
      "emoji": "🎨"
    },
    "color": "gray_background"
  }
}
```

### Paragraph Block

```json
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": [{
      "type": "text",
      "text": {
        "content": "Your text here"
      }
    }]
  }
}
```

### Bulleted List Item

```json
{
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": [{
      "type": "text",
      "text": {
        "content": "List item text"
      }
    }]
  }
}
```

---

## Section/Layout Callout Format (BDS Standard)

When annotating web content for design reference:

```
🎨 Section: [type]; Layout: [layout]; Element: [elements]; Suggest: [suggestions];
```

### Section Types
| Type | Use Case |
|------|----------|
| Hero | Page hero/banner sections |
| Content | General content blocks |
| Feature | Feature highlights |
| Cards | Card grid layouts |
| Process | Step-by-step processes |
| Testimonial | Reviews/testimonials |
| FAQ | Frequently asked questions |
| CTA | Call-to-action sections |
| Team | Team member displays |
| Gallery | Image galleries |
| Values | Core values/benefits |
| Links | Link collections |

### Layout Types
| Layout | Description |
|--------|-------------|
| 1-col | Single column, left-aligned |
| 1-col-center | Single column, centered |
| 2-col | Two columns |
| 2-col-reverse | Two columns, reversed |
| 3-col | Three columns |
| grid | Custom grid layout |

### Element Tokens
`image`, `button`, `form`, `video`, `icon`, `badge`, `link`, `card`, `step`, `stat`

---

## Troubleshooting

### "Property does not exist"

Database properties may have unexpected names:
1. Run `API-retrieve-a-data-source` to get exact property names
2. Check for display name vs internal name differences
3. Relation properties may have custom names like "Level 1 Page" instead of "Relation"

### "Token limit exceeded"

For large pages:
1. Tool saves response to file automatically
2. Use bash + jq to parse the saved JSON file
3. Extract only needed fields (IDs, types, headings)

### Block insertion not appearing

1. Verify `block_id` is the parent page/block
2. Use `after` parameter with correct sibling block ID
3. Check block type is supported for insertion

---

## Bulk Callout Update Workflow

Use this workflow when adding design callouts to multiple pages.

### Step 1: Query Database for Pages

```
mcp__notion__API-query-data-source
  data_source_id: "database-uuid"
  filter: { "property": "Level", "select": { "equals": "Level 2" } }
```

### Step 2: Get Page Content & Identify Section Boundaries

For each page, get block children. If response is saved to file due to size:

```bash
# Extract section structure (headings + dividers)
cat [file.txt] | jq -r '.[0].text' | jq -r '
  .results[] |
  select(.type == "heading_2" or .type == "heading_3" or .type == "divider") |
  "\(.id) | \(.type) | \(
    if .type == "divider" then "---"
    else (.heading_2.rich_text[0].plain_text // .heading_3.rich_text[0].plain_text // "empty")
    end
  )"'
```

This outputs:
```
2c397d34-ed28-8009-be0c-e31cf3d7db63 | heading_2 | Hero Section
2c397d34-ed28-804a-8fda-dab2499d3d20 | divider | ---
2c397d34-ed28-8056-a40d-efdb63d0ae5c | heading_2 | Our Services
```

### Step 3: Insert Callouts After Section Boundaries

Use `after` parameter to insert callouts at specific positions:

```json
{
  "block_id": "page-uuid",
  "after": "heading-block-uuid",
  "children": [{
    "type": "callout",
    "callout": {
      "rich_text": [{
        "type": "text",
        "text": {
          "content": "Section: Hero; Layout: 2-col; Element: image, button;"
        }
      }],
      "icon": { "type": "emoji", "emoji": "🎨" },
      "color": "gray_background"
    }
  }]
}
```

### Step 4: Verify Callouts Added

Re-fetch page content and count callout blocks:

```bash
cat [file.txt] | jq -r '.[0].text' | jq '[.results[] | select(.type == "callout")] | length'
```

### Tips for Efficiency

1. **Parallel API calls**: Fetch multiple page contents simultaneously
2. **Batch identification**: Identify all pages needing updates before starting
3. **Consistent positioning**: Insert callouts after heading blocks, before content
4. **Include color**: Always set `"color": "gray_background"` for visual consistency

---

## TNCLD Project Reference

### Database
- **ID:** `1f797d34-ed28-8162-9c60-000bcae32c74`
- **Properties:** Name, Level, Level 1 Page (relation), Slug, Status

### Page Hierarchy
```
Level 1 (Main Nav):
├── Homepage
├── About
├── Services (parent)
├── Patient Resources (parent)
├── Technology (parent)
├── Patient Stories
└── Contact

Level 2 (Sub-pages):
Services:
├── Hybrid Dentures
├── Invisalign
├── Restorative Dentistry
├── Cosmetic Dentistry
└── Preventative Dentistry

Patient Resources:
├── First Visit
├── Financing
├── Insurance
├── Patient Forms
├── Post-Procedure Care
└── Dental Emergencies
```

---

## Related Documentation

- [Global CLAUDE.md](../../../../CLAUDE.md) - MCP setup instructions
- [BDS Naming Framework](../naming/naming-framework.md) - CSS/Webflow naming conventions
- [Positioning Guide](../positioning/positioning-quick-reference.md) - Layout patterns
