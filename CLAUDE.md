# TNCLD - Claude Code Project Instructions

This file provides project-specific context for Claude Code.

@../../brik/brik-bds/BDS-CONSUMER.md

> **Platform status (2026-08-25).** The Next.js rebuild is **live on Netlify**
> in the two-site model (staging + prod, both `noindex` pre-launch) — see
> [rag:static-site-deploy-model]. The **off-hours DNS cutover is still pending**
> ([#44](https://github.com/brikdesigns/tncld/issues/44)), so `tncld.com` continues
> to serve the **legacy Webflow site via SHA-pinned jsDelivr custom code**. The
> "Custom Code Deployment (jsDelivr)" and Webflow sections below therefore still
> describe the **currently-live** surface and are retired **with** the cutover,
> not before.
>
> **Two codebases share this repo — know which one a finding is in.** `src/` is
> the Next.js rebuild (in progress, not on `tncld.com`). The root-level `*.html`,
> `js/`, `css/` and `updates/` are a **copy of the legacy Webflow export** — Netlify
> never serves them (`publish = ".next"`, [netlify.toml](netlify.toml)), and editing
> them changes nothing live, because the live site is edited in Webflow itself. A
> scanner hit or bug in those files is a fact about the Webflow site: fix it in
> Webflow or let the cutover retire it — never "fix" it here and call it shipped.
> Worked example → [`.claude/references/claude-md-history.md`](.claude/references/claude-md-history.md) § Google Maps key.

---

## Branch & worktree model

| Branch | Role |
|---|---|
| `staging` | **The base branch.** Task branches cut from it, PRs target it. |
| `main` | The **published** state. Promoting `staging` → `main` deploys. Lags `staging` by design. |

**The primary worktree tracks `staging`, not `main`** — never switch it off the base branch. `scripts/new-task.sh` must run from the primary, so a fix to that script takes effect only once the primary has pulled it. Promotion PRs are the exception and target `main`: `./scripts/new-task.sh --base main {slug}`. → rag:tncld-branch-worktree-staging-primary

---

## Compliance Profile

TNCLD is a dental practice in Franklin, TN. Regulatory regimes that apply:

| Regime | Applies? | Why |
|---|---|---|
| **HIPAA Privacy + Security Rules** | Yes | Covered entity (dental provider handling PHI) |
| **ADA Title III** (28 CFR § 36) | Yes | Public accommodation — professional office of a health care provider |
| **Tennessee Human Rights Act** (T.C.A. § 4-21-501) | Yes | State-level disability non-discrimination in public accommodations |
| **Section 1557 of ACA** | No | Confirmed 2026-04-20 — TNCLD does not accept Medicare/Medicaid |
| **Section 504 Rehab Act** | No | Same rationale as 1557 — no federal financial assistance received |

**Accessibility target:** WCAG 2.1 Level AA (the standard DOJ applies under Title III). No AAA bump.

**Accessibility gate:** the shared Brik site a11y gate (`bds-site-a11y`, brik-llm#5076) audits every route in `tests/a11y/public-routes.spec.ts` against the deploy-preview on each PR (`.github/workflows/a11y.yml`, required check `axe`). `scripts/assert-a11y-routes.mjs` fails when a page under `src/app/` (or a slug of a dynamic route) is missing from that list — add the route when you add the page. Run locally: `npm run test:a11y` (builds, serves on :3100). `tests/a11y/baseline.json` is empty and stays empty; WCAG 1.4.3 contrast cannot be baselined on this site (ADR-032).

**Canonical accessibility + compliance standard:** [`@brikdesigns/bds/content-system/compliance/healthcare-ada.md`](https://design.brikdesigns.com/docs/content-system/compliance/Healthcare-ADA) — every content or design change to this site must honor it (promotion history → [`claude-md-history.md`](.claude/references/claude-md-history.md) § Healthcare-ADA standard). Companion: [`brik-llm/websites/shared/CLIENT-ACCESSIBILITY-STANDARDS.md`](https://github.com/brikdesigns/brik-llm/blob/main/websites/shared/CLIENT-ACCESSIBILITY-STANDARDS.md) — universal Brik a11y baseline.

**Required roles at TNCLD:**
- **HIPAA Privacy Officer** (45 CFR § 164.530) — must be a named individual; appears in Privacy Policy + NPP
- **Accessibility Coordinator** — responds to auxiliary-aids requests and accessibility grievances; appears in Accessibility Statement

Legal page drafts for TNCLD live in [markdown/legal-drafts/](markdown/legal-drafts/). Current state + next steps in [NEXT-STEPS.md](markdown/legal-drafts/NEXT-STEPS.md).

---

## Project References

> The values below are project IDs (Webflow Site ID, Notion DB ID), public per the canonical token registry, not secrets. Credential discipline is in § Security below. (Rename history → [`claude-md-history.md`](.claude/references/claude-md-history.md) § Project References.)

| Item | Value |
|------|-------|
| **Client** | Tennessee Center for Laser Dentistry (TNCLD) |
| **Stack** | Webflow (legacy — see cross-repo CLAUDE.md § "Stack by surface") |
| **Webflow Site ID** | `694f1891a016a6340049f761` (public Webflow site ref, not a secret) |
| **Notion content DB** | `1f797d34ed288002a614e70707e88ba4` — "TNCLD Website" (public Notion DB ref, not a secret) |

## Security — read the canonical 5 before any credential work

> **TNCLD-specific:** the only Brik-managed runtime credential for this site is the per-client `WEBFLOW_API_TOKEN`, stored in 1Password (Development vault, item id `v7yjeqrzuqolnt7boicclvheb4` — title `Webflow - TNCLD (tncld-claude-20260122)`, field `credential`). Read it with `op read "op://Development/v7yjeqrzuqolnt7boicclvheb4/credential"`. Used by build automation in `brik-llm/scripts/webflow/`, and callable directly for Data API operations (page DOM read/text + html-embed edits, site publish) — verified working headless 2026-07-09.
>
> Read the canonical 5 doctrine docs before doing anything credential-related:
>
> 1. **Human entry point:** [Notion — Security Best Practices](https://www.notion.so/Security-Best-Practices-35797d34ed2880b49446e2d93497a487)
> 2. **Per-repo lookup:** [`brik-llm/operations/security/repo-token-map.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/repo-token-map.md) — see § "Marketing sites — Webflow (legacy)"
> 3. **Per-secret destinations:** [`brik-llm/operations/security/auth-surfaces.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/auth-surfaces.md)
> 4. **Rotation doctrine:** [`brik-llm/operations/security/when-to-rotate.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/when-to-rotate.md) — **HARD RULE: agents never initiate rotation.**
> 5. **Manual procedure:** [`brik-llm/operations/macos/openclaw/runbooks/token-rotation.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/macos/openclaw/runbooks/token-rotation.md)
>
> **Source-of-truth for all credentials: 1Password Development vault.** Never paste secrets into chat or commits. Reference 1P items by ID, not title. (Retired page → [`claude-md-history.md`](.claude/references/claude-md-history.md) § Credentials source.)

---

## API Access Strategy

**PREFER direct API calls with tokens from `.env` over Webflow MCP OAuth** — MCP tokens expire and need browser re-auth; `.env` tokens are instant and reliable. → rag:tncld-webflow-api-access

---

## Custom Code Deployment (jsDelivr, SHA-pinned)

**The URLs are pinned to a commit — pushing to `main` does NOT reach the live site.** `header.css`/`footer.js` are served via jsDelivr. NEVER paste code bodies into Webflow; paste only the two `<link>`/`<script>` tags. Bump the SHA after every change or nothing ships (`scripts/verify-live-assets.sh` now fails the build if the pin is stale). This surface is retired **with** the DNS cutover (#44), not before. → rag:tncld-jsdelivr-custom-code-deployment

---

## Content source (rebuild)

> **The Next.js rebuild does not read Webflow CMS.** Content is a checked-in
> file: [`json/cms-data.json`](json/cms-data.json), read through the typed
> reader [`src/lib/content.ts`](src/lib/content.ts). TNCLD is the `dental`
> industry key. The eventual swap to Supabase is [#55](https://github.com/brikdesigns/tncld/issues/55).

`cms-data.json` is industry-scoped; `dental` holds: `slug`, `name`, `home`,
`about`, `services`, `contact`, `audience`, `pages`, `serviceDetails`,
`technologyDetails`. Templates render whatever the source holds and never
hardcode copy.

### Legacy Webflow collection (not read by the rebuild)

Retained only for the still-live Webflow site. The live collection is slug
**`services`** (not `services-new`), id `696d6c32c61b66c34cbd65ff` — the #41
extract is the source of truth for its ~58 flat fields.

---

## Legacy URL redirects (cutover-critical)

**Redirects live in `next.config.mjs` `redirects()`, never `netlify.toml`** — a CDN-edge rule can't be asserted in `next dev`. `npm run test:live-urls` asserts all 26 resolve; **delete each interim redirect as its real page lands** or it will shadow the new route. → rag:tncld-legacy-url-redirects

---

## Notion Databases

| Database | ID | Purpose |
|----------|----|---------|
| **TNCLD Website** | `1f797d34ed288002a614e70707e88ba4` | **The content source of record** — 36 pages, section-structured, for every route on the site |

Data source (for the Notion MCP / SQL queries): `collection://1f797d34-ed28-8162-9c60-000bcae32c74`.

**USE the ID above, never any other.** Read with the Notion MCP, never `WebFetch` (no credentials). → rag:tncld-notion-content-source · incident → [`claude-md-history.md`](.claude/references/claude-md-history.md) § Dead Notion ID

---

## Common Tasks

### Refresh Services content from Notion
The rebuild's content pipeline is Notion → `json/cms-data.json`, **not** Notion
→ Webflow. The ETL reads the **TNCLD Website** DB
(`1f797d34ed288002a614e70707e88ba4`, see § Notion Databases) and is re-runnable
and non-destructive
— STAGE 1 writes derived maps to a gitignored `--out` **dir** and does *not*
overwrite `json/cms-data.json` itself:

```bash
npx --yes tsx scripts/migrate-from-notion.ts --out <dir>   # extract (gitignored)
npx --yes tsx scripts/migrate-from-notion.ts --check       # drift gate
```

Promoting the extract over the hand-edited baseline into `json/cms-data.json`
is [#78](https://github.com/brikdesigns/tncld/issues/78); `--check` is red
until then by design.

---

## Website Build Workflow (legacy pipeline)

Legacy `brik-llm/scripts/0N-*/` phase scripts (discovery/content/design/Webflow-push) for the still-live Webflow surface only — **DO NOT EXTEND**; new work runs through brik-client-portal or web/{slug}. → rag:tncld-legacy-build-workflow

---

## Global Standards

For standards that apply to all client projects, reference these authoritative sources:

| Standard | Location |
|----------|----------|
| **Naming Conventions** | [brik-bds/BDS-CONSUMER.md](../../brik/brik-bds/BDS-CONSUMER.md) + [design.brikdesigns.com](https://design.brikdesigns.com) |
| **Webflow Workflows** | [brik-llm/scripts/webflow/](../../brik/brik-llm/scripts/webflow/) |

**Do not duplicate global standards in this repo.** Reference the authoritative sources above.

---

## Related Documentation

- **Global CLAUDE.md:** [../CLAUDE.md](../CLAUDE.md) - MCP setup, troubleshooting
- **Notion SOPs:** [Notion SOPs](https://www.notion.so/1d697d34ed2880e18a07dc060e66787f)
- **Manage Marketing Website:** [Notion](https://www.notion.so/Manage-Marketing-Website-2f697d34ed2880308836dd4c977bc0c8)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
