#!/usr/bin/env node
// Converts the executed Jupyter notebooks (notebooks/**/*.ipynb) into Fumadocs MDX pages.
// Pure Node: it only reads the saved notebook JSON and never executes any code.
//
//   npm run notebooks
//
// - title          -> notebooks/titles.json (notebook path -> title)
// - markdown cells -> MDX (same sanitising as the old Markdown pages)
// - code cells     -> ```python blocks
// - outputs        -> ```text title="Output" blocks; image/png and image/svg+xml are written to
//                     public/notebook-outputs/<notebook path>/cell-<n>-<k>.<ext>
// - the .ipynb is copied to public/notebooks/<notebook path>.ipynb for the download link
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { convertMarkdown, dropLeadingH1, uniqueSlug } from './lib/mdx.mjs';
import {
  assertAsset,
  CONTENT_DIR,
  ensureDir,
  listFiles,
  NOTEBOOK_TITLES,
  NOTEBOOKS_DIR,
  PUBLIC_DIR,
  removeDir,
  sourceStem,
  sourceToContentFile,
} from './lib/site.mjs';

const OUTPUTS_DIR = join(PUBLIC_DIR, 'notebook-outputs');
const DOWNLOADS_DIR = join(PUBLIC_DIR, 'notebooks');

const titles = JSON.parse(readFileSync(NOTEBOOK_TITLES, 'utf8'));
const notebooks = listFiles(NOTEBOOKS_DIR, (f) => f.endsWith('.ipynb'));
for (const src of Object.keys(titles)) {
  if (!notebooks.includes(src)) throw new Error(`notebooks/titles.json: no notebook ${src}`);
}
// Pages a notebook cell may link to: the other notebooks and every MDX page (as `<stem>.md`).
const knownSources = new Set([
  ...notebooks,
  ...listFiles(CONTENT_DIR, (f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '.md')),
]);

// Clean previous output of this script.
removeDir(OUTPUTS_DIR);
removeDir(DOWNLOADS_DIR);
for (const file of listFiles(CONTENT_DIR, (f) => f.endsWith('.mdx'))) {
  const full = join(CONTENT_DIR, file);
  if (/\{\/\* Generated from notebooks\/\S+\.ipynb /.test(readFileSync(full, 'utf8'))) rmSync(full);
}

const assets = new Set();
const warnings = [];
const stats = { notebooks: 0, cells: 0, images: 0, texts: 0, errors: 0 };

for (const src of notebooks) {
  const title = titles[src];
  if (!title) throw new Error(`notebooks/${src} has no title in notebooks/titles.json`);
  const nb = JSON.parse(readFileSync(join(NOTEBOOKS_DIR, src), 'utf8'));
  const stem = sourceStem(src);
  const language =
    nb.metadata?.kernelspec?.language ?? nb.metadata?.language_info?.name ?? 'python';
  const ctx = { source: src, markdownBase: 'url', knownSources, assets, warnings };

  const parts = [];
  let firstMarkdown = true;
  nb.cells.forEach((cell, n) => {
    stats.cells++;
    let text = joinSource(cell.source);
    if (cell.cell_type === 'markdown') {
      if (cell.attachments) throw new Error(`${src} cell ${n}: cell attachments are not supported`);
      // mkdocs-jupyter used `ignore_h1_titles`; the page title comes from titles.json, so the
      // notebook's own leading H1 would be a second title.
      if (firstMarkdown && n === 0) {
        let h1;
        [text, h1] = dropLeadingH1(text);
        if (h1) uniqueSlug(ctx, h1);
      }
      firstMarkdown = false;
      const mdx = convertMarkdown(text, ctx).trim();
      if (mdx) parts.push(mdx);
    } else if (cell.cell_type === 'code') {
      if (text.trim()) parts.push(fence(text, language));
      cell.outputs?.forEach((output, k) => {
        const rendered = renderOutput(output, { src, stem, n, k });
        if (rendered) parts.push(rendered);
      });
    } else if (cell.cell_type === 'raw') {
      if (text.trim()) parts.push(fence(text, 'text'));
    } else {
      throw new Error(`${src} cell ${n}: unknown cell type ${cell.cell_type}`);
    }
  });

  const download = `/notebooks/${stem}.ipynb`;
  const to = join(DOWNLOADS_DIR, `${stem}.ipynb`);
  ensureDir(to);
  writeFileSync(to, readFileSync(join(NOTEBOOKS_DIR, src)));

  const out = sourceToContentFile(src);
  ensureDir(out);
  writeFileSync(
    out,
    `---\ntitle: ${JSON.stringify(title)}\n---\n\n{/* Generated from notebooks/${src} by scripts/convert-notebooks.mjs. Do not edit: edit the notebook and run \`npm run notebooks\`. */}\n\n<NotebookDownload href="${download}" />\n\n${parts.join('\n\n')}\n`,
  );
  stats.notebooks++;
}

for (const asset of assets) assertAsset(asset);

console.log(
  `Converted ${stats.notebooks} notebooks (${stats.cells} cells): ${stats.texts} text outputs, ${stats.images} images, ${stats.errors} error outputs; ${assets.size} referenced assets exist in public/.`,
);
if (warnings.length) console.log(`\nWarnings:\n- ${warnings.join('\n- ')}`);

function joinSource(source) {
  return Array.isArray(source) ? source.join('') : (source ?? '');
}

/** Fenced code block whose fence is longer than any backtick run inside. */
function fence(text, lang, meta = '') {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((s) => s.length));
  const marker = '`'.repeat(Math.max(3, longest + 1));
  return `${marker}${lang}${meta ? ` ${meta}` : ''}\n${text.replace(/\n+$/, '')}\n${marker}`;
}

function stripAnsi(text) {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: matching ANSI escape sequences
  return text.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '');
}

function textOutput(text) {
  const clean = stripAnsi(text).replace(/\n+$/, '');
  if (!clean.trim()) return null;
  stats.texts++;
  return fence(clean, 'text', 'title="Output"');
}

function renderOutput(output, { src, stem, n, k }) {
  switch (output.output_type) {
    case 'stream':
      return textOutput(joinSource(output.text));
    case 'error':
      stats.errors++;
      return textOutput(
        output.traceback?.length
          ? output.traceback.join('\n')
          : `${output.ename}: ${output.evalue}`,
      );
    case 'execute_result':
    case 'display_data': {
      const data = output.data ?? {};
      const known = new Set(['image/png', 'image/svg+xml', 'text/plain']);
      for (const mime of Object.keys(data)) {
        if (!known.has(mime)) throw new Error(`${src} cell ${n}: unsupported output type ${mime}`);
      }
      if (data['image/png'] || data['image/svg+xml']) {
        const ext = data['image/png'] ? 'png' : 'svg';
        const file = `cell-${n}-${k}.${ext}`;
        const to = join(OUTPUTS_DIR, stem, file);
        ensureDir(to);
        const url = `/notebook-outputs/${stem}/${file}`;
        stats.images++;
        if (ext === 'png') {
          writeFileSync(
            to,
            Buffer.from(joinSource(data['image/png']).replace(/\s+/g, ''), 'base64'),
          );
          return `![Cell ${n} output](${url})`;
        }
        // Graphviz SVGs are sized in pt, which remark-image cannot measure: use a plain <img>
        // so the SVG keeps its own size.
        writeFileSync(to, joinSource(data['image/svg+xml']));
        return `<img src="${url}" alt="Cell ${n} output" loading="lazy" />`;
      }
      return data['text/plain'] ? textOutput(joinSource(data['text/plain'])) : null;
    }
    default:
      throw new Error(`${src} cell ${n}: unknown output type ${output.output_type}`);
  }
}
