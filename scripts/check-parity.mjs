#!/usr/bin/env node
// Site consistency checks. Run after `npm run build`.
//
//   npm run check:parity
//
// 1. every URL in scripts/old-urls.txt (the old MkDocs site, except `/`) exists in out/
// 2. every MDX page and folder is listed in its folder's meta.json, and every meta.json entry exists
// 3. every notebook has a generated page, a title and an up-to-date download copy
// 4. no MkDocs leftovers in content/ (.md/.ipynb links, !!!, ???, grid cards, icon shortcodes)
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';
import {
  CONTENT_DIR,
  listFiles,
  NOTEBOOK_TITLES,
  NOTEBOOKS_DIR,
  PUBLIC_DIR,
  ROOT,
  sourceStem,
} from './lib/site.mjs';

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

// 2. MDX pages and folders <-> meta.json
const mdxFiles = listFiles(CONTENT_DIR, (f) => f.endsWith('.mdx'));
const pages = mdxFiles.map((f) => f.replace(/\.mdx$/, ''));
const folders = new Set();
for (const page of pages) {
  for (let dir = posix.dirname(page); dir !== '.'; dir = posix.dirname(dir)) folders.add(dir);
}
const metas = new Map();
for (const dir of folders) {
  const file = join(CONTENT_DIR, dir, 'meta.json');
  if (existsSync(file)) metas.set(dir, JSON.parse(readFileSync(file, 'utf8')));
  else problems.push(`${dir}/ has no meta.json`);
}

/**
 * Is `name` listed in the meta.json of `dir`? `...name` (a folder whose items are shown inline in
 * the parent) counts too. Top-level folders must be roots instead.
 */
const isListed = (dir, name) =>
  metas.get(dir)?.pages?.some((entry) => entry === name || entry === `...${name}`) ?? false;
let listed = 0;
for (const page of pages) {
  const dir = posix.dirname(page);
  if (dir === '.') problems.push(`${page}.mdx is outside a section folder`);
  else if (isListed(dir, posix.basename(page))) listed++;
  else problems.push(`${page} is not listed in ${dir}/meta.json`);
}
for (const dir of folders) {
  const parent = posix.dirname(dir);
  if (parent === '.') {
    if (metas.get(dir)?.root !== true)
      problems.push(`${dir}/meta.json: top level needs "root": true`);
  } else if (!isListed(parent, posix.basename(dir))) {
    problems.push(`${dir}/ is not listed in ${parent}/meta.json`);
  }
}
// Fumadocs syntax that is not a page: ---Separator---, ---, ..., !excluded, [Link](url), external:...
const NOT_A_PAGE = /^(---.*---|---|z?\.\.\.a?|!.*|\[.*\]\(.*\)|external:.*)$/;
for (const [dir, meta] of metas) {
  for (const entry of meta.pages ?? []) {
    if (NOT_A_PAGE.test(entry)) continue;
    const target = join(CONTENT_DIR, dir, entry.replace(/^\.\.\./, ''));
    if (!existsSync(`${target}.mdx`) && !(existsSync(target) && statSync(target).isDirectory())) {
      problems.push(`${dir}/meta.json lists "${entry}", which does not exist`);
    }
  }
}
console.log(
  `Sidebar: ${pages.length} MDX pages, ${listed} listed in meta.json; ${metas.size} meta.json files.`,
);

// 3. notebooks -> generated pages, titles and download copies
const notebooks = listFiles(NOTEBOOKS_DIR, (f) => f.endsWith('.ipynb'));
const titles = JSON.parse(readFileSync(NOTEBOOK_TITLES, 'utf8'));
const BANNER = /\{\/\* Generated from notebooks\/(\S+\.ipynb) /;
const generated = new Map();
for (const file of mdxFiles) {
  const m = BANNER.exec(readFileSync(join(CONTENT_DIR, file), 'utf8'));
  if (m) generated.set(m[1], file);
}
for (const nb of notebooks) {
  const stem = sourceStem(nb);
  if (generated.get(nb) !== `${stem}.mdx`) {
    problems.push(`notebooks/${nb} has no generated page: run \`npm run notebooks\``);
  }
  if (!titles[nb]) problems.push(`notebooks/${nb} has no title in notebooks/titles.json`);
  const copy = join(PUBLIC_DIR, 'notebooks', `${stem}.ipynb`);
  if (!existsSync(copy) || !readFileSync(copy).equals(readFileSync(join(NOTEBOOKS_DIR, nb)))) {
    problems.push(`public/notebooks/${stem}.ipynb is out of date: run \`npm run notebooks\``);
  }
}
for (const [nb, file] of generated) {
  if (!notebooks.includes(nb)) problems.push(`${file} was generated from a missing notebook ${nb}`);
}
for (const nb of Object.keys(titles)) {
  if (!notebooks.includes(nb)) problems.push(`notebooks/titles.json: no notebook ${nb}`);
}
console.log(
  `Notebooks: ${notebooks.length} notebooks, ${generated.size} generated pages, ${Object.keys(titles).length} titles.`,
);

// 4. leftovers
const LEFTOVERS = [
  [/\]\((?!https?:)[^)]*\.(?:md|ipynb)(?:#[^)]*)?\)/, 'relative .md/.ipynb link'],
  [/^\s*!!!/m, '!!! admonition'],
  [/^\s*\?\?\?/m, '??? details'],
  [/class="grid cards"/, 'grid cards'],
  [/:(?:material|fontawesome|simple|octicons)-[a-z0-9-]+:/, 'icon shortcode'],
  [/<!--/, 'HTML comment'],
  [/Generated from docs\//, 'old docs/ banner'],
];
let leftovers = 0;
for (const file of mdxFiles) {
  const text = readFileSync(join(CONTENT_DIR, file), 'utf8');
  for (const [re, what] of LEFTOVERS) {
    if (re.test(text)) {
      problems.push(`${file}: ${what}`);
      leftovers++;
    }
  }
}
console.log(`Leftover MkDocs syntax: ${leftovers} found.`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAll parity checks passed.');
