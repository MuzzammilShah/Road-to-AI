// Converts MkDocs Material flavoured Markdown into MDX that Fumadocs can compile.
//
// Handles: admonitions (!!!), collapsible blocks (???), grid cards, X/Twitter embeds,
// HTML comments, raw HTML -> JSX, Material icon shortcodes, relative links/images and
// characters that MDX would otherwise parse as JSX/expressions ({, }, <).
import { posix } from 'node:path';
import { sourceToUrl } from './site.mjs';

const SITE_ORIGIN = 'https://docs.muhammedshah.com';

/** Material/FontAwesome shortcode -> Lucide icon name (rendered by components/mdx/icon.tsx) or emoji. */
const ICONS = {
  'material-progress-check': { lucide: 'CircleCheckBig' },
  'material-progress-alert': { lucide: 'CircleAlert' },
  // `text` is used inside headings, where JSX would end up in the module-level TOC export.
  'material-progress-star-four-points': { lucide: 'Sparkle', text: '✦' },
  'material-subdirectory-arrow-right': { lucide: 'CornerDownRight' },
  'material-bookshelf': { lucide: 'LibraryBig' },
  'fontawesome-solid-kiwi-bird': { lucide: 'Bird' },
  // Lucide has no owl.
  'material-owl': { emoji: '🦉' },
};

const ADMONITION_TYPES = {
  note: { type: 'info', title: 'Note' },
  info: { type: 'info', title: 'Info' },
  warning: { type: 'warn', title: 'Warning' },
};

/** HTML tags kept (as JSX) when found in Markdown text; any other `<` is escaped. */
const HTML_TAGS = new Set([
  'a',
  'b',
  'br',
  'center',
  'code',
  'div',
  'em',
  'hr',
  'i',
  'img',
  'kbd',
  'p',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
]);
const VOID_TAGS = new Set(['br', 'hr', 'img']);

const FENCE_RE = /^(\s*)(`{3,}|~{3,})/;

/**
 * @typedef {object} ConvertContext
 * @property {string} source       Source path relative to docs/ (for messages and link resolution).
 * @property {'file' | 'url'} markdownBase  Resolve Markdown links against the source file (MkDocs pages)
 *   or the rendered page URL (notebook cells, which mkdocs-jupyter does not rewrite).
 * @property {Set<string>} knownSources  All source files that have a page (relative to docs/).
 * @property {Set<string>} assets  Collects referenced asset paths (relative to docs/).
 * @property {string[]} warnings   Collects messages for the conversion report.
 */

/** Convert one Markdown document (or notebook cell) to MDX. */
export function convertMarkdown(markdown, ctx) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  return renderChunks(blockPass(stripComments(lines), ctx), ctx).join('\n');
}

/**
 * Split off MkDocs front matter. Only `hide:` is used in this site (`hide: [toc]`).
 * @returns {[string, { hide: string[] }]}
 */
export function splitFrontmatter(markdown) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(markdown);
  if (!m) return [markdown, { hide: [] }];
  const hide = [];
  let inHide = false;
  for (const line of m[1].split(/\r?\n/)) {
    if (/^hide:\s*$/.test(line)) inHide = true;
    else if (inHide && /^\s+-\s+(\S+)/.test(line)) hide.push(/^\s+-\s+(\S+)/.exec(line)[1]);
    else if (line.trim()) throw new Error(`Unsupported front matter line: ${line}`);
  }
  return [markdown.slice(m[0].length), { hide }];
}

/** Remove the first line (ignoring HTML comments) if it is an H1 (`# Title`), returning [rest, h1Text]. */
export function dropLeadingH1(markdown) {
  const lines = stripComments(markdown.replace(/\r\n?/g, '\n').split('\n'));
  const first = lines.findIndex((l) => l.trim() !== '');
  if (first === -1 || !/^#\s+/.test(lines[first])) return [markdown, null];
  const h1 = lines[first].replace(/^#\s+/, '').trim();
  lines.splice(first, 1);
  return [lines.join('\n'), h1];
}

/** Remove HTML comments outside code fences. */
export function stripComments(lines) {
  const out = [];
  let fence = null;
  let inComment = false;
  for (const line of lines) {
    if (!inComment) {
      const f = FENCE_RE.exec(line);
      if (fence) {
        if (f && f[2][0] === fence[0] && f[2].length >= fence.length) fence = null;
        out.push(line);
        continue;
      }
      if (f) {
        fence = f[2];
        out.push(line);
        continue;
      }
    }
    let rest = line;
    let kept = '';
    while (rest) {
      if (inComment) {
        const end = rest.indexOf('-->');
        if (end === -1) {
          rest = '';
        } else {
          rest = rest.slice(end + 3);
          inComment = false;
        }
      } else {
        const start = rest.indexOf('<!--');
        if (start === -1) {
          kept += rest;
          rest = '';
        } else {
          kept += rest.slice(0, start);
          rest = rest.slice(start + 4);
          inComment = true;
        }
      }
    }
    // Drop lines that only contained a comment.
    if (kept.trim() !== '' || line.trim() === '') out.push(kept);
  }
  return out;
}

/**
 * Split lines into chunks: code fences (kept verbatim), generated JSX lines (kept verbatim)
 * and Markdown lines (converted inline later).
 * @returns {{ type: 'code' | 'jsx' | 'md', text: string }[]}
 */
function blockPass(lines, ctx) {
  const chunks = [];
  const push = (type, text) => chunks.push({ type, text });
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevBlank = i === 0 || lines[i - 1].trim() === '';

    if (/^\s*([-*+]|\d+\.)\s/.test(line)) inList = true;
    else if (/^\S/.test(line)) inList = false;

    // Indented code block (MDX has none): turn it into a fenced block.
    if (prevBlank && !inList && /^(\t| {4})\S/.test(line)) {
      const block = [];
      let j = i;
      for (; j < lines.length && (lines[j].trim() === '' || /^(\t| {4})/.test(lines[j])); j++) {
        block.push(lines[j].replace(/^(\t| {4})/, ''));
      }
      while (block.length && block.at(-1).trim() === '') block.pop();
      ctx.warnings.push(`${ctx.source}: indented code block at line ${i + 1} converted to a fence`);
      push('code', `\`\`\`\n${block.join('\n')}\n\`\`\``);
      i = i + block.length - 1;
      continue;
    }

    const fence = FENCE_RE.exec(line);
    if (fence) {
      const marker = fence[2];
      const block = [line];
      let j = i + 1;
      for (; j < lines.length; j++) {
        block.push(lines[j]);
        const f = FENCE_RE.exec(lines[j]);
        if (
          f &&
          f[2][0] === marker[0] &&
          f[2].length >= marker.length &&
          !lines[j].trim().slice(f[2].length).trim()
        )
          break;
      }
      if (j >= lines.length)
        ctx.warnings.push(`${ctx.source}: unclosed code fence at line ${i + 1}`);
      push('code', block.join('\n'));
      i = j;
      continue;
    }

    // !!! note "Title"  /  ??? note "Title"
    const adm = /^(\s*)(!!!|\?\?\?\+?)\s*([a-z]+)(?:\s+"(.*)")?\s*$/.exec(line);
    if (adm) {
      const [, indent, marker, kind, title] = adm;
      const def = ADMONITION_TYPES[kind];
      if (!def) throw new Error(`${ctx.source}:${i + 1}: unsupported admonition type "${kind}"`);
      const body = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const l = lines[j];
        if (l.trim() === '') {
          body.push('');
          continue;
        }
        if (!l.startsWith(`${indent}\t`) && !l.startsWith(`${indent}    `)) break;
        body.push(l.slice(indent.length).replace(/^(\t| {4})/, ''));
      }
      while (body.length && body.at(-1) === '') body.pop();
      const inner = renderChunks(blockPass(body, ctx), ctx).join('\n');
      const titleAttr = `title={${JSON.stringify(title ?? def.title)}}`;
      if (marker === '!!!') {
        push(
          'jsx',
          `${indent}<Callout type="${def.type}" ${titleAttr}>\n\n${inner}\n\n${indent}</Callout>`,
        );
      } else {
        push(
          'jsx',
          `${indent}<Accordions>\n${indent}<Accordion ${titleAttr}>\n\n${inner}\n\n${indent}</Accordion>\n${indent}</Accordions>`,
        );
      }
      i = j - 1;
      continue;
    }

    // <div class="grid cards" markdown> ... </div>
    if (/^<div\s+class="grid cards"/.test(line.trim())) {
      const [block, end] = collectDiv(lines, i);
      push('jsx', gridCards(block, ctx));
      i = end;
      continue;
    }

    // <div class="x-twitter-embed" data-url="..."> ... </div>
    const tweet = /^\s*<div\s+class="x-twitter-embed"\s+data-url="([^"]+)"/.exec(line);
    if (tweet) {
      const [, end] = collectDiv(lines, i);
      push('jsx', `<Tweet url="${tweet[1]}" />`);
      i = end;
      continue;
    }

    push('md', line);
  }
  return chunks;
}

/** Collect a `<div>` block up to its matching `</div>`; returns [inner lines, end index]. */
function collectDiv(lines, start) {
  let depth = 0;
  for (let j = start; j < lines.length; j++) {
    depth += (lines[j].match(/<div\b/g) ?? []).length;
    depth -= (lines[j].match(/<\/div>/g) ?? []).length;
    if (depth <= 0) return [lines.slice(start + 1, j), j];
  }
  throw new Error(`Unclosed <div> starting at line ${start + 1}`);
}

/** Material "grid cards" list -> <Cards><Card/></Cards>. */
function gridCards(lines, ctx) {
  const items = [];
  for (const line of lines) {
    if (/^-\s+/.test(line)) items.push([line.replace(/^-\s+/, '')]);
    else if (items.length) items.at(-1).push(line.trim());
  }
  const cards = items.map((item) => {
    const head = /^(?::([a-z0-9-]+):\s*)?\*\*(.+?)\*\*\s*$/.exec(item[0]);
    if (!head) throw new Error(`${ctx.source}: unrecognised card heading "${item[0]}"`);
    const [, icon, title] = head;
    let href;
    const text = [];
    for (const l of item.slice(1)) {
      const link = /^\[.*\]\(([^)]+)\)$/.exec(l);
      if (link) href = resolveHref(link[1], ctx, 'file');
      else if (l && l !== '---') text.push(l);
    }
    const attrs = [`title=${JSON.stringify(title)}`];
    if (icon) attrs.push(`icon={${iconJsx(icon, ctx)}}`);
    if (href) attrs.push(`href="${href}"`);
    return `  <Card ${attrs.join(' ')}>\n    ${escapeText(text.join(' '))}\n  </Card>`;
  });
  return `<Cards>\n${cards.join('\n')}\n</Cards>`;
}

function iconJsx(name, ctx) {
  const icon = ICONS[name];
  if (!icon) throw new Error(`${ctx.source}: no mapping for icon :${name}:`);
  return icon.emoji ? JSON.stringify(icon.emoji) : `<Icon name="${icon.lucide}" />`;
}

function renderChunks(chunks, ctx) {
  return chunks.map((c) => (c.type === 'md' ? convertInline(c.text, ctx) : c.text));
}

/** Inline conversion of one Markdown line (outside code fences). */
function convertInline(line, ctx) {
  const heading = /^#{1,6}\s/.test(line);
  // Split out inline code spans, which MDX leaves alone.
  const parts = line.split(/(`+[^`]*?`+)/);
  const out = parts
    .map((part, idx) => (idx % 2 === 1 ? part : convertText(part, ctx, heading)))
    .join('');
  if (heading && !/\[#[^\]]+\]\s*$/.test(line)) {
    // Pin the anchor MkDocs generated (github-slugger differs on punctuation, emoji and icons),
    // so existing links to `page/#section` keep working.
    const id = uniqueSlug(ctx, line.replace(/^#+\s+/, '').replace(/\s+#+\s*$/, ''));
    if (id) return `${out.replace(/\s+$/, '')} [#${id}]`;
  }
  return out;
}

/** MkDocs de-duplicates heading ids as `id`, `id_1`, `id_2`, ... */
export function uniqueSlug(ctx, headingText) {
  ctx.slugs ??= new Map();
  const base = mkdocsSlug(headingText.replace(ICON_RE, ''));
  if (!base) return null;
  const seen = ctx.slugs.get(base) ?? 0;
  ctx.slugs.set(base, seen + 1);
  return seen ? `${base}_${seen}` : base;
}

const ICON_RE = /:((?:material|fontawesome|simple|octicons)-[a-z0-9-]+):/g;

/** Python-Markdown `toc` default slugify, applied to the heading's text. */
export function mkdocsSlug(markdownText) {
  const text = markdownText
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '')
    // `_` emphasis markers (but keep snake_case words)
    .replace(/(?<!\w)_+|_+(?!\w)/g, '')
    .replace(/<[^>]+>/g, '');
  return (
    text
      .normalize('NFKD')
      // Drop non-ASCII (Python's `.encode('ascii', 'ignore')`).
      .replace(/[^ -~\t\n]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[-\s]+/g, '-')
  );
}

function convertText(text, ctx, heading = false) {
  const tokens = [];
  // Placeholders use a private-use character that never occurs in the notes.
  const hold = (s) => `${tokens.push(s) - 1}`;

  let out = text;

  // `[text]([url](url))` (a link pasted into a link) rendered as a broken href in MkDocs: unwrap it.
  out = out.replace(/\]\(\[([^\]]+)\]\(([^)\s]+)\)\)/g, (_, _label, href) => {
    ctx.warnings.push(`${ctx.source}: repaired nested link to ${href}`);
    return `](${href})`;
  });

  // Autolinks <https://...> are not supported by MDX.
  out = out.replace(/<(https?:\/\/[^\s>]+)>/g, (_, url) => hold(`[${url}](${url})`));

  // Images and links.
  out = out.replace(
    /(!?)\[((?:[^\][]|\[[^\]]*\])*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (_, bang, label, href, title = '') => {
      if (bang) {
        const src = resolveImage(href, ctx, ctx.markdownBase);
        if (/^https?:/.test(src)) {
          // External images bypass remark-image (no build-time size fetch).
          return hold(`<img src="${src}" alt=${JSON.stringify(label)} loading="lazy" />`);
        }
        return hold(`![${escapeText(label)}](${src}${title})`);
      }
      return `[${label}](${hold(resolveHref(href, ctx, ctx.markdownBase))}${title})`;
    },
  );

  // Icon shortcodes.
  out = out.replace(ICON_RE, (_, name) => {
    const icon = ICONS[name];
    if (!icon) throw new Error(`${ctx.source}: no mapping for icon :${name}:`);
    if (heading) {
      const text = icon.emoji ?? icon.text;
      if (!text)
        throw new Error(`${ctx.source}: icon :${name}: in a heading needs a text fallback`);
      return hold(text);
    }
    return hold(icon.emoji ?? `<Icon name="${icon.lucide}" />`);
  });

  // Raw HTML tags -> JSX.
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g, (tag, name) =>
    HTML_TAGS.has(name.toLowerCase()) ? hold(htmlTagToJsx(tag, ctx)) : tag,
  );

  out = escapeText(out);
  return out.replace(/(\d+)/g, (_, n) => tokens[Number(n)]);
}

/** Escape characters MDX treats as syntax in plain text. */
function escapeText(text) {
  return text.replace(/[{}<]/g, (c) => `\\${c}`);
}

function htmlTagToJsx(tag, ctx) {
  if (tag.startsWith('</')) return tag.toLowerCase();
  const m = /^<([a-zA-Z0-9]+)([\s\S]*?)\/?>$/.exec(tag);
  const name = m[1].toLowerCase();
  const attrs = [];
  const style = {};
  for (const a of m[2].matchAll(/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g)) {
    const key = a[1];
    const value = a[2]?.replace(/^["']|["']$/g, '');
    if (key === 'markdown') continue;
    if (key === 'style') Object.assign(style, parseStyle(value ?? ''));
    else if (key === 'class') attrs.push(`className=${JSON.stringify(value)}`);
    else if (key === 'align') style.textAlign = value;
    else if (key === 'width' && name === 'img' && /%$/.test(value)) style.width = value;
    else if (key === 'src') attrs.push(`src="${resolveImage(value, ctx, 'url')}"`);
    else if (key === 'href') attrs.push(`href="${resolveHref(value, ctx, 'url')}"`);
    else attrs.push(value === undefined ? key : `${key}=${JSON.stringify(value)}`);
  }
  if (Object.keys(style).length) attrs.push(`style={${JSON.stringify(style)}}`);
  const open = `<${name}${attrs.length ? ` ${attrs.join(' ')}` : ''}`;
  return VOID_TAGS.has(name) ? `${open} />` : `${open}>`;
}

function parseStyle(css) {
  const style = {};
  for (const decl of css.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl
      .slice(0, idx)
      .trim()
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[prop] = decl.slice(idx + 1).trim();
  }
  return style;
}

/**
 * Resolve a relative reference to a docs/-relative path.
 * - 'file': relative to the source file (how MkDocs resolves Markdown links/images)
 * - 'url' : relative to the rendered directory URL (raw HTML, notebook cells)
 */
function resolveRelative(href, ctx, base) {
  if (base === 'file') return posix.normalize(posix.join(posix.dirname(ctx.source), href));
  const pageUrl = sourceToUrl(ctx.source);
  return new URL(href, `${SITE_ORIGIN}${pageUrl}`).pathname.slice(1);
}

function resolveImage(src, ctx, base) {
  if (/^https?:/.test(src)) {
    if (src.startsWith(SITE_ORIGIN)) return resolveImage(src.slice(SITE_ORIGIN.length), ctx, base);
    return src;
  }
  const rel = src.startsWith('/') ? src.slice(1) : resolveRelative(src, ctx, base);
  if (rel.startsWith('..')) throw new Error(`${ctx.source}: image outside docs/: ${src}`);
  ctx.assets.add(decodeURI(rel));
  return `/${rel}`;
}

/** Rewrite links to other pages as absolute site URLs (keeping #anchors). */
function resolveHref(href, ctx, base) {
  if (href.startsWith(SITE_ORIGIN)) href = href.slice(SITE_ORIGIN.length) || '/';
  if (/^(https?:|mailto:|#)/.test(href)) return href;

  const [path, anchor] = splitAnchor(href);
  if (path.startsWith('/')) {
    if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) {
      ctx.warnings.push(`${ctx.source}: absolute link without trailing slash: ${href}`);
    }
    return href;
  }

  const rel = resolveRelative(path, ctx, base);
  if (/\.(md|ipynb)$/.test(rel)) {
    if (!ctx.knownSources.has(rel))
      throw new Error(`${ctx.source}: link to unknown page ${href} (${rel})`);
    return sourceToUrl(rel) + anchor;
  }
  if (path.endsWith('/') || rel === '')
    return `/${rel ? `${rel.replace(/\/$/, '')}/` : ''}${anchor}`;
  // Other files (images, downloads) under docs/.
  ctx.assets.add(rel);
  return `/${rel}${anchor}`;
}

function splitAnchor(href) {
  const idx = href.indexOf('#');
  return idx === -1 ? [href, ''] : [href.slice(0, idx), href.slice(idx)];
}
