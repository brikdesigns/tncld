// check-bds-binding.mjs — gate for tncld#189 (brik-bds#2678, ADR-043 § 6).
//
// From @brikdesigns/bds 0.195.0, BDS components read only `--bds-*` names.
// The package's prefix bridge aliases each old name to its `--bds-` name, so a
// READ of `--text-primary` keeps resolving — but an OVERRIDE of `--text-primary`
// changes only the alias, and no BDS component sees it. The build stays green
// while BDS components render Brik defaults (tncld#188 shipped exactly that:
// primary buttons went Poppy on staging).
//
// Ported from brik-client-portal `theme-bds-binding.test.ts` (#4454). Fails if:
//  1. Any src CSS, or any inline style in src TSX, declares a bridged old BDS
//     name — with a value, or as a re-scope alias. src reads every token by its
//     `--bds-` name (brik-bds#2711), so a re-scope alias is dead weight.
//  2. Any src CSS/TS/TSX reads a bridged old BDS name via `var(--…)`. The bridge
//     is being retired (brik-bds#3004); such a read resolves to nothing then.
//  3. A `--bds-*` the theme declares is not a real BDS name, or is not bound in
//     the § 6 shape `--bds-{body}: var(--tncld-{body})` with that `--tncld-*`
//     declared in the same block.
//
// Rules 1-2 need the package's prefix-bridge.css for the old-name list; once a
// BDS release drops it they are skipped, and rule 3 still runs.
//
// Runs offline against node_modules, before `next build` (Netlify runs
// `npm run build` on every deploy preview). Run: npm run check:bds-binding
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const SRC = join(root, 'src');
const THEME_PATH = join(SRC, 'styles/theme-tncld.css');
const ID = 'tncld';

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
// The last declaration in a block may omit its `;`, so `}` also terminates.
const DECL = /(--[a-z0-9-]+)\s*:\s*([^;{}]+)(?:;|(?=\}))/g;
// Inline style object keys: `'--text-primary': value` / `"--text-primary": value`.
const INLINE = /['"](--[a-z0-9-]+)['"]\s*:\s*([^,}\n]+)/g;

const read = (spec) => strip(readFileSync(require.resolve(spec), 'utf8'));
let BRIDGE_CSS = null;
try {
  BRIDGE_CSS = read('@brikdesigns/bds/prefix-bridge.css');
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw e;
}
const TOKENS_CSS = read('@brikdesigns/bds/tokens.css');
// Old-name reads: `var(--text-primary)` in CSS, TS strings, or inline styles.
const READ = /var\(\s*(--[a-z0-9-]+)/g;

/** Old (pre-ADR-043) name → the `--bds-` name the bridge aliases it to. */
const BRIDGED = new Map();
for (const [, name, value] of (BRIDGE_CSS ?? '').matchAll(DECL)) {
  const target = value.trim().match(/^var\((--bds-[a-z0-9-]+)\)$/)?.[1];
  if (target) BRIDGED.set(name, target);
}
const BDS_NAMES = new Set(
  [...TOKENS_CSS.matchAll(DECL)].map(([, name]) => name).filter((n) => n.startsWith('--bds-')),
);

const files = (readdirSync(SRC, { recursive: true }))
  .map((f) => join(SRC, f));
const CSS_FILES = files.filter((f) => f.endsWith('.css'));
const TSX_FILES = files.filter((f) => /\.(tsx|jsx)$/.test(f));
const TS_FILES = files.filter((f) => /\.(ts|js|mjs)$/.test(f));

const THEME = strip(readFileSync(THEME_PATH, 'utf8'));
const BLOCKS = [...THEME.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => ({
  selector: selector.trim(),
  decls: [...body.matchAll(DECL)].map(([, name, value]) => ({ name, value: value.trim() })),
}));
const body = (name) => name.replace(new RegExp(`^--(bds-|${ID}-)?`), '');

const problems = [];

// Sanity: a moved or renamed bridge must fail loudly, not pass vacuously.
if (BRIDGE_CSS !== null && BRIDGED.size < 500) {
  problems.push(`sanity: read only ${BRIDGED.size} bridged names from prefix-bridge.css`);
}
if (!BLOCKS.some((b) => b.decls.some((d) => d.name.startsWith('--bds-')))) {
  problems.push(`sanity: ${relative(root, THEME_PATH)} binds no --bds-* name`);
}

// 1. No old-name declaration anywhere in src.
const checkOverrides = (file, text, pattern) => {
  for (const [, name, value] of text.matchAll(pattern)) {
    const target = BRIDGED.get(name);
    const v = value.trim().replace(/^['"`]|['"`]$/g, '');
    if (target) problems.push(`${relative(root, file)}: ${name}: ${v} — declare ${target} instead`);
  }
};
for (const f of CSS_FILES) checkOverrides(f, strip(readFileSync(f, 'utf8')), DECL);
for (const f of TSX_FILES) checkOverrides(f, readFileSync(f, 'utf8'), INLINE);

// 2. No old-name read anywhere in src.
for (const f of [...CSS_FILES, ...TSX_FILES, ...TS_FILES]) {
  const text = f.endsWith('.css') ? strip(readFileSync(f, 'utf8')) : readFileSync(f, 'utf8');
  for (const [, name] of text.matchAll(READ)) {
    if (BRIDGED.has(name)) problems.push(`${relative(root, f)}: reads ${name} — read ${BRIDGED.get(name)} instead`);
  }
}

// 3. Binding shape inside the theme.
const bound = new Set(BLOCKS.flatMap((b) => b.decls.map((d) => d.name)).filter((n) => n.startsWith('--bds-')));
for (const { selector, decls } of BLOCKS) {
  const ownHere = new Set(decls.map((d) => d.name).filter((n) => n.startsWith(`--${ID}-`)));
  for (const { name, value } of decls) {
    if (name.startsWith('--bds-')) {
      const expected = `var(--${ID}-${body(name)})`;
      if (!BDS_NAMES.has(name)) problems.push(`${selector}: ${name} is not a BDS token`);
      if (value !== expected) problems.push(`${selector}: ${name}: ${value} — expected ${expected}`);
      else if (!ownHere.has(`--${ID}-${body(name)}`)) {
        problems.push(`${selector}: ${name} binds --${ID}-${body(name)}, which this block never declares`);
      }
    }
  }
}

if (problems.length) {
  console.error(`check-bds-binding: ${problems.length} problem(s) (tncld#189, ADR-043 § 6):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(
  BRIDGE_CSS === null
    ? `check-bds-binding: ok — ${bound.size} --bds-* bindings (no prefix-bridge.css in this BDS release; old-name checks skipped)`
    : `check-bds-binding: ok — ${bound.size} --bds-* bindings, no old-name declarations or reads in src (${BRIDGED.size} bridged names checked)`,
);
