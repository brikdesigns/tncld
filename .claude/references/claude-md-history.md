---
name: tncld CLAUDE.md history
description: Change history and one worked incident moved out of CLAUDE.md so the always-loaded file holds rules only.
type: reference
last-verified: 2026-10-21
---

# tncld CLAUDE.md — history moved out

Each section below is text that used to sit in [CLAUDE.md](../../CLAUDE.md). The rule stays there; this page holds the history.

## Google Maps key

The Google Maps key in `js/webflow.js` belongs to Webflow's map widget. The Next.js rebuild uses no Maps key (brik-llm#3795). A scanner hit on that key is a fact about the Webflow site, not the rebuild.

## Healthcare-ADA standard

The canonical standard was promoted to BDS on 2026-04-21. The TNCLD remediation work seeded that doc. The original draft, [markdown/legal-drafts/BRIK-HEALTHCARE-ADA-STANDARDS.md](../../markdown/legal-drafts/BRIK-HEALTHCARE-ADA-STANDARDS.md), is kept only as historical reference.

## Project References

The section was renamed on 2026-05-05. It was titled "Project Credentials", which was a misnomer: its values are project IDs, not secrets.

## Credentials source

CLAUDE.md used to link a legacy "Notion API Keys" Notion page as the credential source of truth. It is retired. The source of truth is the 1Password Development vault.

## Dead Notion ID

A dead Notion DB ID once sat in the Notion Databases table. It caused real content to be filed as missing. The table now holds one ID, and CLAUDE.md says to use that one and no other.
