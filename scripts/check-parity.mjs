#!/usr/bin/env node
// Migration checks against the old MkDocs site. Run after `npm run build`.
//
//   npm run check:parity
//
// 1. every URL in scripts/old-urls.txt (except `/`, now the landing page) exists in out/
// 2. every page in the mkdocs.yml nav has an MDX page that is listed in its folder's meta.json
// 3. no MkDocs leftovers in content/ (.md/.ipynb links, !!!, ???, grid cards, icon shortcodes)
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { navLabels, readNav } from './lib/nav.mjs';
import { CONTENT_DIR, listFiles, MKDOCS_YML, ROOT, sourceStem } from './lib/site.mjs';

const OUT = join(ROOT, 'out');
const problems = [];

// 1. URL parity
const oldUrls = readFileSync(join(ROOT, 'scripts', 'old-urls.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.startsWith('/'));
const exported = new Set(
  listFiles(OUT, (f) => f.endsWith('index.html')).map((f) => `/${f.replace(/index\.html$/, '')}`),
);
const missing = oldUrls.filter((u) => u !== '/' && !exported.has(u));
const extra = [...exported].filter((u) => !oldUrls.includes(u)).sort();
for (const u of missing) problems.push(`missing old URL: ${u}`);
console.log(
  `URL parity: ${oldUrls.length - 1 - missing.length}/${oldUrls.length - 1} old URLs exist.`,
);
console.log(`Extra exported pages (not in the old site): ${extra.join(', ') || 'none'}`);

// 2. nav pages -> MDX pages -> meta.json
const labels = navLabels(readNav(MKDOCS_YML));
const navPages = [...labels.keys()].filter((p) => p !== 'index.md');
const mdx = new Set(
  listFiles(CONTENT_DIR, (f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '')),
);
let listed = 0;
for (const src of navPages) {
  const stem = sourceStem(src);
  if (!mdx.has(stem)) {
    problems.push(`no MDX page for docs/${src}`);
    continue;
  }
  const metaFile = join(CONTENT_DIR, dirname(stem), 'meta.json');
  const pages = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')).pages : [];
  if (pages?.includes(posix.basename(stem))) listed++;
  else problems.push(`${stem} is not listed in ${posix.join(dirname(stem), 'meta.json')}`);
}
const notebooks = navPages.filter((p) => p.endsWith('.ipynb')).length;
console.log(
  `Pages: ${navPages.length} in the old nav (${navPages.length - notebooks} Markdown + ${notebooks} notebooks), ${mdx.size} MDX pages, ${listed} listed in the sidebar.`,
);
if (mdx.size !== navPages.length)
  problems.push(`MDX page count ${mdx.size} != nav page count ${navPages.length}`);

// 3. leftovers
const LEFTOVERS = [
  [/\]\((?!https?:)[^)]*\.(?:md|ipynb)(?:#[^)]*)?\)/, 'relative .md/.ipynb link'],
  [/^\s*!!!/m, '!!! admonition'],
  [/^\s*\?\?\?/m, '??? details'],
  [/class="grid cards"/, 'grid cards'],
  [/:(?:material|fontawesome|simple|octicons)-[a-z0-9-]+:/, 'icon shortcode'],
  [/<!--/, 'HTML comment'],
];
for (const file of listFiles(CONTENT_DIR, (f) => f.endsWith('.mdx'))) {
  const text = readFileSync(join(CONTENT_DIR, file), 'utf8');
  for (const [re, what] of LEFTOVERS) if (re.test(text)) problems.push(`${file}: ${what}`);
}
console.log(`Leftover MkDocs syntax: ${problems.filter((p) => p.includes('.mdx:')).length} found.`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAll parity checks passed.');
