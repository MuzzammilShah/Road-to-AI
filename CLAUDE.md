# Road to AI: docs site

Personal documentation site (notes, Jupyter notebooks, book notes on AI), served at docs.muhammedshah.com. It was migrated from MkDocs Material; `MIGRATION_NOTES.md` has the history and decisions. The MkDocs files are gone: `content/docs/` and `notebooks/` are the only sources.

> **Do not merge this branch into `main` before the deployment task.** `.github/workflows/ci.yml` on `main` still runs `mkdocs gh-deploy`, which fails without `mkdocs.yml`. The deployment task replaces that workflow (plan in `MIGRATION_NOTES.md`). Don't edit `ci.yml` before then.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + Fumadocs 16:
  - `fumadocs-core`;
  - `fumadocs-ui`, aliased to the Base UI build `@fumadocs/base-ui`;
  - `fumadocs-mdx` with the macro API in `lib/source.ts`, so there is no `source.config.ts`.
- **Docs layout:** the Fumadocs **spacious** layout (as on fumadocs.dev). It adds two pieces of the classic layout: the collapsed-sidebar pill and the `'normal'` TOC style.
- **Styling:** Tailwind CSS 4, the Fumadocs `neutral` preset, the Inter font (`next/font`), #121212 dark background, subtle per-section accent colours.
- **Search:** Orama static search. The index is exported to `/api/search.json`.
- **Landing page:** `HomeLayout` with a Vanta.js globe (`vanta@0.5.24` on `three@0.134.0`, client-only).
- **Tooling:** TypeScript (strict) and Biome (lint + format). npm only.

## Commands

```bash
npm ci                    # install exactly what package-lock.json says
npm run dev               # http://localhost:3000 (dev mode is slower than the real site)
npm run build             # static export into out/
npx serve out -l 4173     # preview the export (serve is a local devDependency)
npm run typecheck         # next typegen && tsc --noEmit
npm run lint              # biome check (npm run format to fix formatting)
npm run notebooks         # re-convert notebooks/**/*.ipynb -> content/docs/**/*.mdx
npm run check:links       # after build: every internal href/src/#anchor in out/ must resolve
npm run check:parity      # after build: old MkDocs URLs exist, pages/folders = meta.json entries,
                          # notebooks converted and up to date, no MkDocs leftovers
```

## Hard constraints

- **Local installs only.** No global npm packages, no `sudo`, no `brew`, no edits to shell profiles or `~/.npmrc`.
- **Pin exact versions.** `.npmrc` has `save-exact=true`, so always commit `package-lock.json`. Node version is in `.nvmrc` (24); `engines` is `>=22`.
- **Static export only.** `trailingSlash: true` and `images.unoptimized` are always on. `output: 'export'` applies to builds only (`next.config.mjs` checks the phase), so `next dev` answers unknown URLs with 404 instead of throwing. In practice:
  - no server runtime;
  - no route handlers that need a request;
  - every dynamic route has `generateStaticParams` (+ `dynamicParams = false`);
  - route handlers set `dynamic = 'force-static'`.
- **URL parity with the old MkDocs site.** Docs are served at the site root (`baseUrl: '/'`), and folder and file names, including their case, are the URLs. Never rename content files or folders without adding redirects. `scripts/old-urls.txt` lists the URLs that must keep working. Headings carry explicit MkDocs-style ids (`## Title [#id]`), so old `#anchor` links keep working too.
- **Notebooks are never executed.** The converter only reads the saved outputs.
- **Biome is limited by an allow-list** in `biome.json`. It also formats YAML and Markdown, so keep `content/`, `notebooks/`, `*.md` and `.github/` out of its scope.
- **Read the versioned docs before using framework APIs:**
  - Next.js docs ship in `node_modules/next/dist/docs/` (see `AGENTS.md`).
  - Fumadocs: https://www.fumadocs.dev/docs, but trust the installed package source and types in `node_modules/fumadocs-*` when they differ.

## Content structure

- **`content/docs/`** holds the docs content, with one root folder per sidebar section. Root folders show up in the section dropdown at the top of the sidebar.
  - `ZeroToHero/` is "Neural Networks". It contains `Micrograd/`, `Makemore-part1..5/`, `GPT-1/`, `GPT-2/`, `GPT-Tokenizer/` and `General-MISC/`.
  - `Books/` is "Library". It contains `AI-Engineering/`.
- **`meta.json`** in each folder controls the sidebar. They are all hand-maintained (no generator any more):
  - `title` and `pages` set order and labels;
  - `"---Label---"` adds a separator;
  - listing `"index"` makes the folder's index a child item;
  - `"root": true` marks a section;
  - root folders also have `icon` and `description` for the dropdown.
- **Page front matter:** `title`, optional `description`, and `hideToc: true` to hide the table of contents.
- **`notebooks/`** holds the executed `.ipynb` files at the same relative paths as their pages (`notebooks/ZeroToHero/GPT-1/gpt-dev.ipynb` → `content/docs/ZeroToHero/GPT-1/gpt-dev.mdx`). `notebooks/titles.json` maps each notebook path to its page title. The generated MDX carries a "Generated from notebooks/…" banner: never edit those pages by hand, edit the notebook and re-run the converter.
- **`public/`:**
  - `assets/images/` holds images referenced by pages;
  - `notebook-outputs/` holds the generated notebook output images;
  - `notebooks/` holds the `.ipynb` download copies;
  - `manifest.webmanifest` and the icons are for the PWA / iOS home-screen;
  - `CNAME` is the custom domain for GitHub Pages (exported as `out/CNAME`).
- **`scripts/`:** `convert-notebooks.mjs` (+ `lib/mdx.mjs`, `lib/site.mjs`), `check-links.mjs`, `check-parity.mjs`, `old-urls.txt`.

## App code map

- **Routes:**
  - `app/(home)/` is the landing page.
  - `app/(docs)/layout.tsx` is the spacious `DocsLayout` + `CollapsedSidebarControls`.
  - `app/(docs)/[...slug]/page.tsx` is the docs pages: TOC style `'normal'`, TOC titles stripped of links, `SectionAccent`.
  - `app/api/search.json/route.ts` builds the static search index.
- **`app/global.css`:**
  - the theme, plus `@import "fumadocs-ui/css/generated/spacious.css"`;
  - section colours (`--section-*`), the landing background (`.landing-surface`), wide table/image handling and the tweet card styles.
  - Fumadocs' `preset.css` does not include the spacious layout's classes. Any layout from `fumadocs-ui/css/generated/` that preset.css doesn't list needs the same import, otherwise its pages render unstyled.
- **`lib/`:**
  - `source.ts`: loader, MDX options, `getDocumentTitle`.
  - `sections.tsx`: dropdown icons, `SectionAccent`.
  - `layout.shared.tsx`: navbar title and links (add links here).
  - `shared.ts`: site name, URL, GitHub repo.
- **`components/`:**
  - `mdx.tsx`: MDX component map.
  - `mdx/heading.tsx`: headings that contain a link skip Fumadocs' self-link, and TOC entries get their links stripped. Both prevent `<a>` inside `<a>`.
  - `mdx/icon.tsx`, `mdx/tweet.tsx`, `mdx/notebook-download.tsx`.
  - `collapsed-sidebar-controls.tsx`: the classic "open sidebar + search" pill.
  - `home/globe.tsx` and `home/hero-globe.tsx`: the Vanta globe.
  - `site-footer.tsx`.
- **Switching to navbar tabs instead of the dropdown:** change `fumadocs-ui/layouts/spacious` (+ `/page`) back to `fumadocs-ui/layouts/docs` and pass `tabMode="top"`. The collapsed-sidebar pill then becomes unnecessary, because the classic layout has its own.
- **MDX components available in content:**
  - from Fumadocs: `Callout`, `Cards`/`Card`, `Accordions`/`Accordion`;
  - site-specific: `Icon` (Lucide), `Tweet` (X/Twitter embed), `NotebookDownload`.
- **Escaping in MDX:** `{`, `}` and `<` in prose must be escaped (`\{`, `\}`, `\<`). HTML must be JSX (`className`, `style={{...}}`, self-closing `<img />`).

## Performance notes

- **CSS selectors:** avoid `body:has(...)` / layout-wide `:has(...)` selectors. The browser re-checks them on every DOM change, and the TOC changes the DOM while scrolling. Emit small `<style>` rules from the component that knows the state instead (see `SectionAccent`, `CollapsedSidebarControls`).
- **Vanta:** it already skips rendering while the globe is off-screen.
- **Judge speed on the export:** use `npm run build && npx serve out -l 4173`, not `npm run dev`.

## How to add a page

1. Create `content/docs/<Section>/<path>/<name>.mdx` with front matter `title:`. The URL becomes `/<Section>/<path>/<name>/`.
2. Add `<name>` to the `pages` array of the folder's `meta.json`, at the position it should appear in the sidebar.
3. Put images in `public/assets/images/...` and reference them as `/assets/images/...`.
4. Run the verification below.

A new sub-folder needs its own `meta.json` (`title`, `pages`) and must be listed in its parent's `pages`.

## How to add a section

1. Create `content/docs/<Section>/meta.json` with `"root": true`, `title`, `description`, `icon` and `pages`.
2. In `lib/sections.tsx`, add the Lucide icon to `sectionIcons` and map the folder name to its accent colour (used by `SectionAccent`). In `app/global.css`, define the `--section-*` colour (light and dark) and its `[data-section-icon]` rule.
3. Optionally add a navbar link in `lib/layout.shared.tsx`.

## How to add a notebook

1. Save the executed notebook (outputs included) as `notebooks/<Section>/<path>/<name>.ipynb`. The path becomes the URL `/<Section>/<path>/<name>/`.
2. Add `"<Section>/<path>/<name>.ipynb": "<Sidebar title>"` to `notebooks/titles.json`.
3. Add `<name>` to the `pages` array of `content/docs/<Section>/<path>/meta.json`.
4. Run `npm run notebooks`. This writes `content/docs/<path>.mdx`, output images to `public/notebook-outputs/<path>/` and a download copy to `public/notebooks/`. Images referenced from markdown cells resolve against the page URL and must already exist in `public/` (the converter fails otherwise).
5. Commit the generated files too. The build does not run the converter, and `check:parity` fails if a notebook changed without re-converting.

To edit a notebook's prose, change only the affected markdown-cell `source` strings in the `.ipynb` JSON, then re-run `npm run notebooks`.

## Verification before calling something done

```bash
npm run typecheck && npm run lint && npm run build && npm run check:links && npm run check:parity
```

Then run `npx serve out -l 4173` and look at the changed pages in light and dark mode.

**Gotchas:**
- **Stale route types:** if `tsc` complains about missing modules under `.next/dev/types` after a route rename, run `rm -rf .next`.
- **Service worker on `localhost:3000`:** a worker from another local app (it requests `/sw.js`) can serve stale CSS there. Unregister it in DevTools → Application, or use another port.
