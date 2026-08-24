/**
 * migrate-from-notion.ts — TNCLD Notion → json/cms-data.json migration (issue #70)
 *
 * Re-runnable ETL that replaces the manual MCP copy-paste #56/#68/#72/#73 did by
 * hand. Reads the "TNCLD Website" CMS database, serializes each page's block
 * body to the markdown the templates already consume, and emits the
 * `serviceDetails` / `technologyDetails` / `pages` maps.
 *
 * Home / about / services live under different keys (different shape) and legal
 * pages come from markdown/ via src/lib/legal.ts — neither is in scope here.
 *
 * STAGE 1 of 2 — EXTRACT + TRANSFORM (this file). Writes the derived maps to a
 *   local, gitignored --out file. It does NOT write json/cms-data.json.
 *
 * STAGE 2 — PROMOTE (gated, tracked as the #70 follow-up). Adopting this ETL's
 *   output as json/cms-data.json is blocked on two source fixes: #56's committed
 *   copy is sentence-cased (BDS standard) while Notion is Title Case across all
 *   headings — a lossy transform (proper nouns like the doctor surnames are
 *   indistinguishable from common words), so it must be fixed at the Notion
 *   source, not here — and the hub pages (#56 restructured `Element: link`
 *   sections into per-card `section.href`) need a design nod. See the #70 thread.
 *
 * Idempotent: `--check` re-derives the maps and diffs them against the committed
 *   json, exiting non-zero on drift. Post-promote this is the CI gate that
 *   catches Notion edits never migrated; pre-promote it is EXPECTED to report
 *   drift (the heading-case + hub-card deltas above).
 *
 * The section→field mapping is faithful, but #56 made two editorial choices the
 * raw blocks do not carry, both encoded explicitly here:
 *   1. Route links — Notion renders "Invisalign" / "Request a consultation →" as
 *      plain text (href=NONE); ROUTE_MAP resolves the known titles + CTA phrases
 *      to their routes.
 *   2. Slug overrides — "Payment & Insurance" → `payments-and-insurance`,
 *      'Why "Laser Dentistry"…' → `why-laser-dentistry` (see ROWS).
 *
 * Auth: reads NOTION_TOKEN from the environment. Source it from 1Password (the
 *   registered workspace-brik integration, which is shared with this DB):
 *     export NOTION_TOKEN=$(op read \
 *       "op://Development/qc4jca2wmakrglct6oxaz3iu2y/credential")
 *
 * Run:   npx --yes tsx scripts/migrate-from-notion.ts [--out <dir>]  # extract
 *        npx --yes tsx scripts/migrate-from-notion.ts --check         # drift gate
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DB_ID = '1f797d34ed288002a614e70707e88ba4'; // "TNCLD Website" CMS DB (public ref)
const NOTION_VERSION = '2022-06-28';
const HERE = dirname(fileURLToPath(import.meta.url));
const CMS_PATH = resolve(HERE, '../json/cms-data.json');

type MapName = 'serviceDetails' | 'technologyDetails' | 'pages';

/**
 * The 18 in-scope rows, by exact Notion "Page Name". `slug` is the json key /
 * route segment; most slugify cleanly, the two marked OVERRIDE do not.
 */
const ROWS: { name: string; map: MapName; slug: string }[] = [
  // serviceDetails — Section "Services", Level 2
  { name: 'Cosmetic Dentistry', map: 'serviceDetails', slug: 'cosmetic-dentistry' },
  { name: 'Dental Implants', map: 'serviceDetails', slug: 'dental-implants' },
  { name: 'Hybrid Dentures', map: 'serviceDetails', slug: 'hybrid-dentures' },
  { name: 'Invisalign', map: 'serviceDetails', slug: 'invisalign' },
  { name: 'Preventative Dentistry', map: 'serviceDetails', slug: 'preventative-dentistry' },
  { name: 'Restorative Dentistry', map: 'serviceDetails', slug: 'restorative-dentistry' },
  // technologyDetails — Section "About", Level 3
  { name: 'Digital Imaging', map: 'technologyDetails', slug: 'digital-imaging' },
  { name: 'Laser Dentistry', map: 'technologyDetails', slug: 'laser-dentistry' },
  { name: 'Oral Cancer Detection', map: 'technologyDetails', slug: 'oral-cancer-detection' },
  { name: 'Same Day Crowns (CEREC)', map: 'technologyDetails', slug: 'same-day-crowns-cerec' },
  // pages
  { name: 'Patient Resources', map: 'pages', slug: 'patient-resources' },
  { name: 'New Patients', map: 'pages', slug: 'new-patients' },
  { name: 'Membership Plan', map: 'pages', slug: 'membership-plan' },
  { name: 'Payment & Insurance', map: 'pages', slug: 'payments-and-insurance' }, // OVERRIDE
  { name: 'FAQs', map: 'pages', slug: 'faqs' },
  { name: 'Meet The Doctors', map: 'pages', slug: 'meet-the-doctors' },
  { name: 'Technology', map: 'pages', slug: 'technology' },
  { name: 'Why “Laser Dentistry” Is Our Standard', map: 'pages', slug: 'why-laser-dentistry' }, // OVERRIDE
];

/**
 * Link text → route. Built from ROWS (service/technology titles) plus the CTA
 * phrases and hub pages that appear in Related / CTA sections. Keys are
 * normalized (lowercased, trailing arrow + punctuation stripped) via linkKey().
 */
const ROUTE_MAP: Record<string, string> = {
  'request a consultation': '/request-appointment',
  'request an appointment': '/request-appointment',
  'request appointment': '/request-appointment',
  'contact us': '/contact',
};
for (const row of ROWS) {
  const route =
    row.map === 'serviceDetails'
      ? `/services/${row.slug}`
      : row.map === 'technologyDetails'
        ? `/technology/${row.slug}`
        : ['technology', 'why-laser-dentistry', 'meet-the-doctors', 'patient-resources'].includes(row.slug)
          ? `/${row.slug}`
          : `/patient-resources/${row.slug}`;
  ROUTE_MAP[linkKey(row.name)] = route;
}

function linkKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[→–—>]+/g, ' ') // arrows / dashes / gt
    .replace(/[“”"']/g, '') // smart + straight quotes
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Notion types (only the fields this ETL reads) ──────────────────────────

interface RichText {
  plain_text: string;
  href: string | null;
  annotations: { bold: boolean };
}
interface Block {
  type: string;
  [k: string]: unknown;
}
interface Row {
  id: string;
  properties: Record<string, { title?: RichText[] }>;
}

function token(): string {
  const t = process.env.NOTION_TOKEN;
  if (!t) {
    console.error(
      'NOTION_TOKEN is not set. Source the registered workspace-brik integration:\n' +
        '  export NOTION_TOKEN=$(op read "op://Development/qc4jca2wmakrglct6oxaz3iu2y/credential")',
    );
    process.exit(1);
  }
  return t;
}

async function notion<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Notion ${path} → ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function fetchRows(): Promise<Row[]> {
  const rows: Row[] = [];
  let cursor: string | undefined;
  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const page = await notion<{ results: Row[]; has_more: boolean; next_cursor: string | null }>(
      `databases/${DB_ID}/query`,
      { method: 'POST', body: JSON.stringify(body) },
    );
    rows.push(...page.results);
    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return rows;
}

async function fetchBlocks(pageId: string): Promise<Block[]> {
  const blocks: Block[] = [];
  let cursor: string | undefined;
  do {
    const qs = new URLSearchParams({ page_size: '100' });
    if (cursor) qs.set('start_cursor', cursor);
    const page = await notion<{ results: Block[]; has_more: boolean; next_cursor: string | null }>(
      `blocks/${pageId.replace(/-/g, '')}/children?${qs}`,
    );
    blocks.push(...page.results);
    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return blocks;
}

function pageName(row: Row): string {
  const title = row.properties['Page Name']?.title ?? [];
  return title.map((t) => t.plain_text).join('');
}

// ─── Block → markdown ───────────────────────────────────────────────────────

function rich(block: Block): RichText[] {
  return ((block[block.type] as { rich_text?: RichText[] })?.rich_text ?? []) as RichText[];
}

/** One rich_text run → markdown, applying bold then link. */
function inline(spans: RichText[]): string {
  return spans
    .map((s) => {
      let t = s.plain_text;
      if (s.annotations?.bold) t = `**${t}**`;
      if (s.href) t = `[${t}](${s.href})`;
      return t;
    })
    .join('');
}

/** Resolve a bare title / CTA phrase to `[text](route)`, else return text. */
function linkify(text: string): string {
  const route = ROUTE_MAP[linkKey(text)];
  return route ? `[${text}](${route})` : text;
}

interface Section {
  code: string; // the "Section-NN: Name" delimiter text
  blocks: Block[];
}

/** Split a page's blocks into sections at each `code` "Section-NN:" delimiter. */
function splitSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  for (const block of blocks) {
    if (block.type === 'code') {
      const label = rich(block)[0]?.plain_text ?? '';
      if (/^Section-/i.test(label)) {
        sections.push({ code: label.split('\n')[0], blocks: [] });
        continue;
      }
    }
    if (sections.length) sections[sections.length - 1].blocks.push(block);
  }
  return sections;
}

const HEADINGS = new Set(['heading_1', 'heading_2', 'heading_3']);
const isArrowCta = (b: Block): boolean =>
  b.type === 'paragraph' && /→\s*$/.test(rich(b).map((s) => s.plain_text).join(''));
const isEmptyPara = (b: Block): boolean => b.type === 'paragraph' && inline(rich(b)).trim() === '';

/**
 * Serialize one section's body blocks to markdown. `kind` is derived from the
 * section's code label so Testimonial paragraphs become blockquotes and CTA
 * arrow-links collapse onto one ` · `-joined line.
 */
function serializeBody(blocks: Block[], kind: string): string {
  const out: string[] = [];
  const ctaLinks: string[] = [];
  const flushCta = () => {
    if (ctaLinks.length) {
      out.push(ctaLinks.splice(0).join(' · '));
    }
  };

  for (const b of blocks) {
    if (isEmptyPara(b) || b.type === 'divider') continue;

    if (isArrowCta(b)) {
      const label = rich(b)
        .map((s) => s.plain_text)
        .join('')
        .replace(/\s*→\s*$/, '')
        .trim();
      ctaLinks.push(linkify(label));
      continue;
    }
    flushCta();

    const text = inline(rich(b));
    switch (b.type) {
      case 'heading_3':
        out.push(`### ${text}`);
        break;
      case 'bulleted_list_item':
        out.push(`- ${kind === 'related' ? linkify(text) : text}`);
        break;
      case 'numbered_list_item':
        out.push(`1. ${text}`);
        break;
      case 'quote':
        out.push(`> ${text}`);
        break;
      case 'paragraph':
        out.push(kind === 'testimonial' ? `> ${text}` : text);
        break;
      default:
        if (!HEADINGS.has(b.type) && text.trim()) out.push(text);
    }
  }
  flushCta();

  // Consecutive list items join with a single newline; everything else \n\n.
  let md = '';
  for (let i = 0; i < out.length; i++) {
    const line = out[i];
    const isList = line.startsWith('- ') || /^\d+\.\s/.test(line);
    const prevList = i > 0 && (out[i - 1].startsWith('- ') || /^\d+\.\s/.test(out[i - 1]));
    if (i === 0) md = line;
    else md += (isList && prevList ? '\n' : '\n\n') + line;
  }
  return md;
}

const sectionKind = (code: string): string => {
  const name = code.replace(/^Section-\d+:\s*/i, '').toLowerCase();
  if (name.includes('hero')) return 'hero';
  if (name.includes('testimonial')) return 'testimonial';
  if (name.includes('related')) return 'related';
  if (name.includes('cta')) return 'cta';
  return 'default';
};

interface PageContent {
  title: string;
  lede: string;
  sections: { title: string; body: string }[];
}

function serializePage(blocks: Block[]): PageContent {
  const sections = splitSections(blocks);
  let title = '';
  let lede = '';
  const body: { title: string; body: string }[] = [];

  for (const section of sections) {
    const kind = sectionKind(section.code);
    if (kind === 'hero') {
      const h1 = section.blocks.find((b) => b.type === 'heading_1');
      title = h1 ? inline(rich(h1)) : '';
      const ledeBlock = section.blocks.find(
        (b) => b.type === 'paragraph' && !isEmptyPara(b) && !isArrowCta(b),
      );
      lede = ledeBlock ? inline(rich(ledeBlock)) : '';
      continue;
    }
    const heading = section.blocks.find((b) => HEADINGS.has(b.type));
    const rest = section.blocks.filter((b) => b !== heading);
    body.push({
      title: heading ? inline(rich(heading)) : '',
      body: serializeBody(rest, kind),
    });
  }
  return { title, lede, sections: body };
}

// ─── Main ─────────────────────────────────────────────────────────────────

/** Per-entry keys where the derived maps differ from the committed json. */
function driftReport(
  derived: Record<MapName, Record<string, PageContent>>,
  cms: { dental: Record<MapName, Record<string, PageContent>> },
): string[] {
  const drift: string[] = [];
  for (const map of ['serviceDetails', 'technologyDetails', 'pages'] as MapName[]) {
    for (const slug of Object.keys(derived[map])) {
      if (JSON.stringify(derived[map][slug]) !== JSON.stringify(cms.dental[map]?.[slug])) {
        drift.push(`${map}.${slug}`);
      }
    }
  }
  return drift;
}

async function main() {
  const check = process.argv.includes('--check');
  const rows = await fetchRows();
  const byName = new Map(rows.map((r) => [pageName(r), r]));

  const derived: Record<MapName, Record<string, PageContent>> = {
    serviceDetails: {},
    technologyDetails: {},
    pages: {},
  };

  for (const spec of ROWS) {
    const row = byName.get(spec.name);
    if (!row) {
      throw new Error(`Notion row not found for "${spec.name}" — DB changed?`);
    }
    const blocks = await fetchBlocks(row.id);
    derived[spec.map][spec.slug] = serializePage(blocks);
  }

  const cms = JSON.parse(readFileSync(CMS_PATH, 'utf8')) as {
    dental: Record<MapName, Record<string, PageContent>>;
  };

  if (check) {
    const drift = driftReport(derived, cms);
    if (drift.length) {
      console.error(`migrate-from-notion --check: DRIFT in ${drift.length} entr(y/ies):`);
      for (const d of drift) console.error(`  - ${d}`);
      process.exit(1);
    }
    console.log('migrate-from-notion --check: OK — committed json matches Notion.');
    return;
  }

  // STAGE 1: write the derived maps to the gitignored --out dir. Promoting these
  // into json/cms-data.json is the gated STAGE 2 (see the file header + #70).
  const outArg = process.argv.indexOf('--out');
  const outDir = resolve(
    HERE,
    outArg > -1 ? process.argv[outArg + 1] : '.notion-migration-output',
  );
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'cms-maps.json');
  writeFileSync(outPath, JSON.stringify(derived, null, 2) + '\n', 'utf8');

  const drift = driftReport(derived, cms);
  console.log(`migrate-from-notion: wrote ${ROWS.length} entries → ${outPath}`);
  console.log(
    drift.length
      ? `  ${drift.length} entr(y/ies) differ from committed cms-data.json ` +
          `(expected pre-promote — see #70):\n    ${drift.join('\n    ')}`
      : '  matches committed cms-data.json.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
