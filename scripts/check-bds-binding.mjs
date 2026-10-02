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
//     name with a value. The only legal declaration is the re-scope alias
//     `--{body}: var(--bds-{body})`.
//  2. A `--bds-*` the theme declares is not a real BDS name, or is not bound in
//     the § 6 shape `--bds-{body}: var(--tncld-{body})` with that `--tncld-*`
//     declared in the same block.
//  3. A re-scope alias points at a name the theme never binds, or a bound name
//     has no re-scope alias in its block.
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
const BRIDGE_CSS = read('@brikdesigns/bds/prefix-bridge.css');
const TOKENS_CSS = read('@brikdesigns/bds/tokens.css');

/** Old (pre-ADR-043) name → the `--bds-` name the bridge aliases it to. */
const BRIDGED = new Map();
for (const [, name, value] of BRIDGE_CSS.matchAll(DECL)) {
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

const THEME = strip(readFileSync(THEME_PATH, 'utf8'));
const BLOCKS = [...THEME.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => ({
  selector: selector.trim(),
  decls: [...body.matchAll(DECL)].map(([, name, value]) => ({ name, value: value.trim() })),
}));
const body = (name) => name.replace(new RegExp(`^--(bds-|${ID}-)?`), '');

const problems = [];

// Sanity: a moved or renamed bridge must fail loudly, not pass vacuously.
if (BRIDGED.size < 500) problems.push(`sanity: read only ${BRIDGED.size} bridged names from prefix-bridge.css`);
if (!BLOCKS.some((b) => b.decls.some((d) => d.name.startsWith('--bds-')))) {
  problems.push(`sanity: ${relative(root, THEME_PATH)} binds no --bds-* name`);
}

// 1. No old-name override anywhere in src.
const checkOverrides = (file, text, pattern) => {
  for (const [, name, value] of text.matchAll(pattern)) {
    const target = BRIDGED.get(name);
    const v = value.trim().replace(/^['"`]|['"`]$/g, '');
    if (target && v !== `var(${target})`) {
      problems.push(`${relative(root, file)}: ${name}: ${v} — bind ${target} instead`);
    }
  }
};
for (const f of CSS_FILES) checkOverrides(f, strip(readFileSync(f, 'utf8')), DECL);
for (const f of TSX_FILES) checkOverrides(f, readFileSync(f, 'utf8'), INLINE);

// 2 + 3. Binding shape inside the theme.
const bound = new Set(BLOCKS.flatMap((b) => b.decls.map((d) => d.name)).filter((n) => n.startsWith('--bds-')));
for (const { selector, decls } of BLOCKS) {
  const ownHere = new Set(decls.map((d) => d.name).filter((n) => n.startsWith(`--${ID}-`)));
  const aliasesHere = new Set(decls.map((d) => d.name).filter((n) => BRIDGED.has(n)));
  for (const { name, value } of decls) {
    if (name.startsWith('--bds-')) {
      const expected = `var(--${ID}-${body(name)})`;
      if (!BDS_NAMES.has(name)) problems.push(`${selector}: ${name} is not a BDS token`);
      if (value !== expected) problems.push(`${selector}: ${name}: ${value} — expected ${expected}`);
      else if (!ownHere.has(`--${ID}-${body(name)}`)) {
        problems.push(`${selector}: ${name} binds --${ID}-${body(name)}, which this block never declares`);
      }
      const old = `--${body(name)}`;
      if (BRIDGED.get(old) === name && !aliasesHere.has(old)) {
        problems.push(`${selector}: ${name} is bound but ${old} is not re-scoped in this block`);
      }
    } else if (BRIDGED.has(name) && !bound.has(BRIDGED.get(name))) {
      problems.push(`${selector}: ${name} re-points at ${BRIDGED.get(name)}, which the theme never binds`);
    }
  }
}

if (problems.length) {
  console.error(`check-bds-binding: ${problems.length} problem(s) (tncld#189, ADR-043 § 6):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`check-bds-binding: ok — ${bound.size} --bds-* bindings, no old-name overrides in src (${BRIDGED.size} bridged names checked)`);
