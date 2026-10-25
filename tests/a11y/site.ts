import { join } from 'node:path';

/**
 * What the a11y suite knows about THIS site. Everything else — axe tags,
 * injected-tooling exclusions, the baseline matcher, ADR-032 grading — comes
 * from the shared gate, `@brikdesigns/bds/site-a11y` (brik-llm#5076), pinned
 * through the `bds-site-a11y` alias in package.json.
 *
 * No `import.meta`: this package is CommonJS (no `"type": "module"`), so
 * Playwright loads the specs as CJS.
 */

export const BASELINE_PATH = join(__dirname, 'baseline.json');
