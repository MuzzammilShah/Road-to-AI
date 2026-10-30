#!/usr/bin/env node
// Converts the MkDocs Markdown pages (docs/**/*.md) into Fumadocs MDX (content/docs/**/*.mdx)
// and generates every meta.json from the mkdocs.yml nav. Re-runnable: docs/ is never modified.
//
//   npm run convert:pages
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { convertMarkdown, dropLeadingH1, splitFrontmatter, uniqueSlug } from './lib/mdx.mjs';
import { navLabels, readNav } from './lib/nav.mjs';
import {
  APP_ASSETS,
  CONTENT_DIR,
  copyAsset,
  DOCS_DIR,
  ensureDir,
  listFiles,
  MKDOCS_YML,
  sourceStem,
  sourceToContentFile,
} from './lib/site.mjs';

const PAGE_BANNER = 'Generated from docs/';
/** Nav sections that become Fumadocs root folders (sidebar dropdown). */
const ROOT_SECTIONS = { 'Neural Networks': 'Neural Networks', Library: 'Library' };

const nav = readNav(MKDOCS_YML);
const labels = navLabels(nav);
const knownSources = new Set(listFiles(DOCS_DIR, (f) => /\.(md|ipynb)$/.test(f)));

for (const src of knownSources) {
  if (!labels.has(src)) throw new Error(`docs/${src} is not in the mkdocs.yml nav`);
}

// Clean previous output of this script (generated pages and all meta.json files).
for (const file of listFiles(CONTENT_DIR)) {
  const full = join(CONTENT_DIR, file);
  if (file.endsWith('meta.json')) rmSync(full);
  else if (
    file.endsWith('.mdx') &&
    /\{\/\* Generated from docs\/\S+\.md /.test(readFileSync(full, 'utf8'))
  ) {
    rmSync(full);
  }
}

const assets = new Set(APP_ASSETS);
const warnings = [];
const titleDiffs = [];
let pageCount = 0;

for (const src of [...labels.keys()].filter((p) => p.endsWith('.md'))) {
  if (src === 'index.md') continue; // the old home page becomes the custom landing page
  const [raw, frontmatter] = splitFrontmatter(readFileSync(join(DOCS_DIR, src), 'utf8'));
  const [body, h1] = dropLeadingH1(raw);
  const title = labels.get(src);
  if (h1 === null) warnings.push(`${src}: no leading H1`);
  else if (h1 !== title) titleDiffs.push(`| \`${src}\` | ${title} | ${h1.replace(/\|/g, '\\|')} |`);

  const ctx = { source: src, markdownBase: 'file', knownSources, assets, warnings };
  // The dropped H1 still took its slug in MkDocs (affects `_1` suffixes of later headings).
  if (h1) uniqueSlug(ctx, h1);
  const mdx = convertMarkdown(body, ctx).trim();

  let fm = `title: ${JSON.stringify(title)}\n`;
  for (const hidden of frontmatter.hide) {
    if (hidden === 'toc') fm += 'hideToc: true\n';
    else warnings.push(`${src}: front matter "hide: ${hidden}" has no equivalent`);
  }

  const out = sourceToContentFile(src);
  ensureDir(out);
  writeFileSync(
    out,
    `---\n${fm}---\n\n{/* ${PAGE_BANNER}${src} by scripts/convert-pages.mjs. Do not edit until the cutover; edit docs/${src} and run \`npm run convert:pages\`. */}\n\n${mdx}\n`,
  );
  pageCount++;
}

// meta.json files from the nav tree.
const metas = buildMetas(nav);
for (const [dir, meta] of metas) {
  const file = join(CONTENT_DIR, dir, 'meta.json');
  ensureDir(file);
  writeFileSync(file, `${JSON.stringify(meta, null, 2)}\n`);
}

for (const asset of assets) copyAsset(asset);

console.log(
  `Converted ${pageCount} pages, wrote ${metas.size} meta.json files, copied ${assets.size} assets.`,
);
if (titleDiffs.length) {
  console.log(
    `\nNav label differs from the page H1 (${titleDiffs.length} pages; the nav label is used as title):`,
  );
  console.log('| Source | Nav label (title) | Old H1 |\n|---|---|---|');
  console.log(titleDiffs.join('\n'));
}
if (warnings.length) console.log(`\nWarnings:\n- ${warnings.join('\n- ')}`);

/**
 * Turn the MkDocs nav into meta.json files. A nav group becomes a folder meta.json when all its
 * pages live in a sub-folder of the parent folder; otherwise (flat files grouped in the nav, e.g.
 * "Set A") it becomes a `---Separator---` in the parent folder, so URLs never change.
 * @returns {Map<string, object>} folder (relative to content/docs) -> meta
 */
function buildMetas(navTree) {
  const result = new Map();

  const allPaths = (node) => (node.path ? [node.path] : node.children.flatMap(allPaths));
  const commonDir = (node) => {
    const dirs = allPaths(node).map((p) => posix.dirname(p).split('/'));
    const common = [];
    for (let i = 0; dirs.every((d) => i < d.length && d[i] === dirs[0][i]); i++)
      common.push(dirs[0][i]);
    return common.join('/');
  };

  const pagesOf = (group, folder) => {
    const pages = [];
    for (const child of group.children) {
      if (child.path) {
        if (posix.dirname(child.path) !== folder) {
          throw new Error(`Nav entry ${child.path} is not directly inside ${folder}/`);
        }
        pages.push(posix.basename(sourceStem(child.path)));
        continue;
      }
      const dir = commonDir(child);
      if (dir === folder) {
        pages.push(`---${child.label}---`, ...pagesOf(child, folder));
      } else if (posix.dirname(dir) === folder) {
        result.set(dir, { title: child.label, pages: pagesOf(child, dir) });
        pages.push(posix.basename(dir));
      } else {
        throw new Error(`Nav group "${child.label}" (${dir}) does not map onto ${folder}/`);
      }
    }
    return pages;
  };

  for (const section of navTree) {
    if (section.path) continue; // Home
    const title = ROOT_SECTIONS[section.label];
    if (!title) throw new Error(`Unexpected top-level nav section "${section.label}"`);
    const dir = commonDir(section);
    result.set(dir, { title, root: true, pages: pagesOf(section, dir) });
  }
  return result;
}
