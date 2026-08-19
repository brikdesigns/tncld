/**
 * migrate-from-webflow.ts — TNCLD Webflow → Supabase migration (issue #41)
 *
 * STAGE 1 of 2: EXTRACT + TRANSFORM (this file).
 *   Reads every CMS collection + its items from the live TNCLD Webflow site via
 *   the Direct API, normalizes each item to a target-agnostic shape, and writes
 *   the result to local JSON under --out. Also emits an asset manifest (every
 *   image URL referenced by an item) for the Storage port.
 *
 * STAGE 2: LOAD (separate slice — deliberately NOT in this file).
 *   Writing into the shared Brik Portal *Staging* Supabase (ref
 *   `lmhzpzobdkstzpvsqest`) is portal-owned and blocked on the content-target
 *   decision (portal 00054 CMS model vs. a TNCLD-owned schema) + a minimal
 *   is_public read contract. See the #41 thread. This script writes NO database.
 *
 * Auth: reads WEBFLOW_API_TOKEN from the environment. Source it from 1Password —
 *   export WEBFLOW_API_TOKEN=$(op read \
 *     "op://Development/v7yjeqrzuqolnt7boicclvheb4/credential")
 *
 * Run:  npx --yes tsx scripts/migrate-from-webflow.ts [--out scripts/.migration-output]
 */

const WEBFLOW_SITE_ID = '694f1891a016a6340049f761'; // public TNCLD site ref
const API = 'https://api.webflow.com/v2';
const PAGE = 100; // Webflow items endpoint max page size

type WebflowField = { slug: string; type: string };
type WebflowCollection = { id: string; displayName: string; slug: string };
type WebflowItem = {
  id: string;
  fieldData: Record<string, unknown>;
  lastPublished?: string | null;
  createdOn?: string;
};

/** A normalized, platform-neutral content record — one per Webflow item. */
type NormalizedEntry = {
  webflowItemId: string;
  collectionSlug: string;
  slug: string;
  name: string;
  publishedAt: string | null;
  /** All Webflow fieldData, verbatim, minus the extracted name/slug. */
  data: Record<string, unknown>;
  /** Every image URL this item references (for the Storage port). */
  assets: string[];
};

function token(): string {
  const t = process.env.WEBFLOW_API_TOKEN;
  if (!t) {
    console.error(
      'WEBFLOW_API_TOKEN is not set. Source it from 1Password:\n' +
        '  export WEBFLOW_API_TOKEN=$(op read "op://Development/v7yjeqrzuqolnt7boicclvheb4/credential")',
    );
    process.exit(1);
  }
  return t;
}

async function wf<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token()}`, 'accept-version': '2.0.0' },
  });
  if (!res.ok) {
    throw new Error(`Webflow ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** Pull every image URL out of a fieldData object. Webflow Image fields are
 *  `{ url, alt, ... }`; multi-image fields are arrays of the same. */
function extractAssets(data: Record<string, unknown>): string[] {
  const urls: string[] = [];
  const visit = (v: unknown) => {
    if (!v) return;
    if (Array.isArray(v)) return v.forEach(visit);
    if (typeof v === 'object') {
      const url = (v as Record<string, unknown>).url;
      if (typeof url === 'string') urls.push(url);
    }
  };
  Object.values(data).forEach(visit);
  return [...new Set(urls)];
}

async function fetchAllItems(collectionId: string): Promise<WebflowItem[]> {
  const items: WebflowItem[] = [];
  let offset = 0;
  for (;;) {
    const page = await wf<{ items: WebflowItem[]; pagination: { total: number } }>(
      `/collections/${collectionId}/items?limit=${PAGE}&offset=${offset}`,
    );
    items.push(...page.items);
    if (items.length >= page.pagination.total || page.items.length === 0) break;
    offset += PAGE;
  }
  return items;
}

function normalize(collectionSlug: string, item: WebflowItem): NormalizedEntry {
  const fd = { ...item.fieldData };
  const slug = String(fd.slug ?? '');
  const name = String(fd.name ?? '');
  delete fd.slug;
  delete fd.name;
  return {
    webflowItemId: item.id,
    collectionSlug,
    slug,
    name,
    publishedAt: item.lastPublished ?? null,
    data: fd,
    assets: extractAssets(item.fieldData),
  };
}

async function main() {
  const outArg = process.argv.indexOf('--out');
  const outDir = outArg > -1 ? process.argv[outArg + 1] : 'scripts/.migration-output';

  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir(outDir, { recursive: true });

  const { collections } = await wf<{ collections: WebflowCollection[] }>(
    `/sites/${WEBFLOW_SITE_ID}/collections`,
  );

  const allAssets = new Set<string>();
  const summary: Array<{ collection: string; items: number; assets: number }> = [];

  for (const col of collections) {
    const items = await fetchAllItems(col.id);
    const entries = items.map((i) => normalize(col.slug, i));
    entries.forEach((e) => e.assets.forEach((a) => allAssets.add(a)));
    await writeFile(
      `${outDir}/${col.slug}.json`,
      JSON.stringify({ collection: col, entries }, null, 2),
    );
    summary.push({
      collection: `${col.displayName} (${col.slug})`,
      items: entries.length,
      assets: entries.reduce((n, e) => n + e.assets.length, 0),
    });
  }

  await writeFile(
    `${outDir}/assets-manifest.json`,
    JSON.stringify({ total: allAssets.size, urls: [...allAssets].sort() }, null, 2),
  );

  console.log('Extract + transform complete →', outDir);
  console.table(summary);
  console.log(`Distinct asset URLs: ${allAssets.size}`);
  console.log('\nStage 2 (load into Supabase) is a separate slice — see #41.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
