# Migration notes: MkDocs Material → Fumadocs

Running log for the `major-update/framework-switch` branch (merged as PR #38). **Archived** after the launch: moved from the repo root to `archive/`. It describes the migration as it happened. For day-to-day work see `MAINTAINING.md` and `CLAUDE.md`; for an overview see `archive/README.md`.

> **Deployed on 2026-10-31.** The cutover below was completed and the first Actions deploy (run 41114813097) succeeded. The site is live from GitHub Actions.

## Installed versions (exact pins, `.npmrc` has `save-exact=true`)

| Package | Version | Note |
|---|---|---|
| next | 16.4.3 | template pinned 16.4.2; bumped to latest patch |
| react / react-dom | 19.3.1 | |
| fumadocs-core | 16.17.9 | |
| fumadocs-ui | `npm:@fumadocs/base-ui@16.17.9` | the template aliases the Base UI build of Fumadocs UI |
| fumadocs-mdx | 15.4.10 | uses the macro API (`fumadocs-mdx/macro`), so there is no `source.config.ts` |
| lucide-react | 1.65.0 | |
| cn | 0.5.1 | shadcn's class-name merger, used by the template |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | |
| typescript | 7.0.2 | |
| @biomejs/biome | 2.6.4 | linter + formatter |
| serve | 14.2.6 | dev-only, used to preview `out/` |
| next-themes | 0.4.6 | already used by Fumadocs UI; made direct for `useTheme` (tweets, landing globe) |
| zod | 4.6.7 | already used by Fumadocs; made direct for the extended page schema (`hideToc`) |

- **Node:** `.nvmrc` = 24 (matches the dev machine, v24.11.1; your choice in Phase 0). `engines.node` = `>=22`.
- **Scaffolder:** `create-fumadocs-app@16.2.27 --template +next+fuma-docs-mdx+static --linter biome --search orama --pm npm --no-git -y`. It ran in the session scratchpad, and the files were reviewed before copying.

## Decisions

- **Template:** `+next+fuma-docs-mdx+static`, the scaffolder's own static-export variant. It already uses `staticGET` and `useStaticSearch`.
- **Removed from the template:**
  - the `llms.txt`, `llms-full.txt` and `llms.mdx` routes;
  - the `og/docs` image route;
  - the page-actions buttons (copy markdown / view options), which depended on the llms routes;
  - the sample content.
  - None of these are needed now, and "Ask AI" style features are out of scope.
- **Root URL hosting:**
  - `lib/source.ts` uses `baseUrl: '/'`.
  - The docs live in `app/(docs)/[...slug]/page.tsx`, a required catch-all with `dynamicParams = false`.
  - The landing page is `app/(home)/page.tsx`.
  - The catch-all never matches `/`.
- **Slugs keep their case.** Verified in `fumadocs-core/dist/source/plugins/slugs.js`: `getSlugs` only `encodeURI`s path segments. So `A-Main-Notebook.mdx` → `/ZeroToHero/Makemore-part1/A-Main-Notebook/`.
- **Section switcher:**
  - `ZeroToHero/meta.json` and `Books/meta.json` set `"root": true`, plus `icon` and `description` for the dropdown.
  - **Docs layout:** since your review, the **spacious** layout (`fumadocs-ui/layouts/spacious`), the one fumadocs.dev uses.
    - The sidebar sits flush left; the classic layout centred the whole grid in `--fd-layout-width`, which left a gap on the left.
    - The page sits in a rounded, bordered panel.
    - The section dropdown sits at the top of the sidebar.
  - **Navbar tabs instead:** the spacious layout has no `tabMode`. Switch the two imports back to `fumadocs-ui/layouts/docs` and pass `tabMode="top"` (valid values `'auto' | 'top'`).
  - **Section accents:** each docs page emits `<style>body{--color-fd-primary:var(--section-…)}</style>` (`SectionAccent` in `lib/sections.tsx`). That gives a subtle indigo (Neural Networks) or amber (Library), with light and dark variants. It colours the active sidebar item, the TOC and similar accents. The dropdown icons and the landing cards use the same colours.
- **`output: 'export'` only for builds:** `next.config.mjs` checks the phase. In `next dev`, export mode made every unknown URL (`/sw.js`, Chrome's `/.well-known/appspecific/com.chrome.devtools.json`) throw "missing param in generateStaticParams()". Dev now returns 404, and `npm run build` still exports.
- **Landing below the hero:** the whole home page uses the globe's background (`.landing-surface`: white / #121212). The intro section fills the screen below the navbar on desktop.
- **Trailing slashes:** `trailingSlash: true` makes Next's `Link` emit `/a/b/` hrefs, and the export writes `a/b/index.html`.
- **Static search:**
  - `app/api/search.json/route.ts` exports `staticGET`, which is written to `out/api/search.json`.
  - `components/search.tsx` passes `from: '/api/search.json'` to `useStaticSearch`.
  - The index is about 3.0 MB raw, 0.6 MB gzipped, for 72 pages. It is downloaded the first time someone opens search.
  - The template's extensionless `/api/search` would be served as `application/octet-stream`, which is not compressed. The `.json` name gets `application/json`, which GitHub Pages can compress.
  - Code blocks are not indexed (Fumadocs default); notebook prose is.
- **Font:** Inter via `next/font/google` (the template default, and your old MkDocs font).
- **Theme:**
  - The `neutral` preset.
  - The dark background is overridden to `#121212` in `app/global.css`.
  - The default theme is system (next-themes default via `RootProvider`).
- **Metadata (root layout):**
  - Title template is `%s | Road to AI`.
  - Manifest, favicon (`docs-logo.png`) and apple-touch-icon.
  - `appleWebApp` + an explicit `apple-mobile-web-app-capable` meta. Next 16 only emits `mobile-web-app-capable`.
  - `theme-color` is light `#ffffff` / dark `#121212`.
- **Docs-page footer:** the copyright line sits under each page body, above the prev/next links (`components/site-footer.tsx`).
- **Navbar links:**
  - Neural Networks / Library live in `lib/layout.shared.tsx`.
  - The docs layout hides them (`links={[]}`) because the sidebar dropdown does that job there.
- **Biome:**
  - Scoped with an explicit allow-list: `app/`, `components/`, `lib/`, `scripts/` and the root config files.
  - Biome 2.6 also formats YAML and Markdown. A first `biome check --write` reformatted `mkdocs.yml`, `ci.yml`, `README.md` and `instructions.md`. I restored them with `git checkout` before any commit, so they are byte-identical to `main`.
  - `biome migrate` replaced the deprecated `recommended` key with `preset`.
- **`AGENTS.md`:** generated by `next dev` (Next 16); it points agents at `node_modules/next/dist/docs/`. Committed as Next recommends.
- **Search route:** `export const dynamic = 'force-static'`, as the bundled Next 16 static-export guide requires for route handlers.
- **Assets:** only images that are actually referenced get copied to `public/assets/images/`. `blog-assets/` (93 MB) and the unused leftovers are dropped (your decision in Phase 0).

## Content conversion (Phase 2)

**Scripts:**
- `npm run convert:pages` runs `scripts/convert-pages.mjs`: `docs/**/*.md` → `content/docs/**/*.mdx`, plus every `meta.json` and the referenced images.
- `npm run notebooks` runs `scripts/convert-notebooks.mjs`: `docs/**/*.ipynb` → `.mdx`, plus output images and the download copies.
- `npm run convert` runs both.
- Shared code lives in `scripts/lib/` (`nav.mjs`, `mdx.mjs`, `site.mjs`).
- The scripts are pure Node with no dependencies. They never write to `docs/` and never execute notebook code.
- Each script deletes only files carrying its own "Generated from docs/…" banner, so re-runs are clean.

**Results:**
- Pages: 34 of 34 Markdown pages converted. Old `index.md` → the custom landing page in Phase 3.
- Notebooks: 38 of 38. 981 cells, 269 text outputs, 64 images (20 PNG, 44 SVG), 0 error outputs. Output MIME types are only `text/plain`, `image/png` and `image/svg+xml`; the script fails loudly on anything else.
- Navigation: 15 `meta.json` files.
- Assets: 45 image assets copied, out of 175 files in `docs/assets/images`.
- Manual edits to generated files: none. Everything is reproducible from the scripts.

**How the conversion works:**
- **Titles:** the frontmatter `title` is the `mkdocs.yml` nav label, and the leading H1 is removed (notebooks too, since `ignore_h1_titles` was set). The labels that differ from the old H1 are listed below.
  - Browser-tab titles: 8 pages are all called "Lecture Notes" and 8 "Jupyter Notebook". Their `<title>` gets the sidebar context, e.g. "Lecture Notes (Set A) · Language Model-1" (`getDocumentTitle` in `lib/source.ts`). The visible page title stays the nav label.
- **Nav → meta.json:**
  - A nav group becomes a folder `meta.json` when all of its pages are in a sub-folder.
  - Groups of flat files become `---Separators---` inside the parent folder, so URLs never change.
  - Each folder's `index` is listed explicitly, which makes it a child item ("Micrograd") under a non-clickable group ("Backpropagation"), exactly like the MkDocs nav.
- **Admonitions:** `!!! note/info/warning "Title"` → `<Callout type="info|warn" title=…>`. `??? note` → `<Accordions><Accordion title="Note">`.
- **Grid cards** (Books index) → `<Cards><Card>`. The whole card is the link, so the "View my notes" link text is gone.
- **Icons:**
  - `:material-…:` / `:fontawesome-…:` → `<Icon name="…"/>` (Lucide: CircleCheckBig, CircleAlert, Sparkle, CornerDownRight, LibraryBig, Bird).
  - `:material-owl:` → 🦉 at first, because Lucide has no owl; later replaced by the Lucide `Feather` icon for consistency (`Bird` is already the other book's icon).
  - Inside headings the star becomes "✦" text: JSX in a heading would land in the module-level TOC export and fail.
  - The icons that were only in H1s went away with the H1s.
- **Raw HTML → JSX:** `style` strings become objects, `class` becomes `className`, `align`/`width` become style, and void tags are self-closed. This includes the GPT-2 `display:flex` side-by-side images, which keep the same inline layout as before.
- **Escaping:** `{ } <` outside code are escaped. `<!-- -->` comments are removed.
- **Links:** `.md`/`.ipynb` links are rewritten to absolute directory URLs, keeping the `#anchor`. Absolute `https://docs.muhammedshah.com/...` links become root-relative.
- **Images:**
  - Paths become `/assets/images/...`.
  - Markdown links/images resolve against the file; raw-HTML `src` and notebook cells resolve against the page URL, as MkDocs/mkdocs-jupyter did.
  - External images become plain `<img>` and are never fetched at build time (`remarkImageOptions.external: false`, `useImport: false`).
- **Heading anchors:** every heading gets an explicit MkDocs-style id (`## Title [#id]`, Python-Markdown slugify, with the `_1` suffix for duplicates). All 302 old non-H1 heading anchors exist in the new build. The only ones missing are the 43 ids of the removed page H1s; those links still land at the top of the right page.
- **Front matter:** `hide: [toc]` (the 4 Books chapters) → `hideToc: true`, a custom schema field that turns the TOC off.
- **Tweets:** `<div class="x-twitter-embed" data-url>` → `<Tweet url/>` (`components/mdx/tweet.tsx`). It loads `platform.twitter.com/widgets.js`, follows the site theme, and shows a link card until the widget renders. The CSS is ported from `x-twitter-link-card.css` into `app/global.css`. No new package was needed.
- **Notebook outputs:**
  - stream and `text/plain` → ```` ```text title="Output" ````; ANSI codes are stripped.
  - PNG → Markdown image. SVG (graphviz, sized in `pt`) → plain `<img>` at its native size, because `remark-image` measured these as `NaN`.
  - Files go to `public/notebook-outputs/<notebook path>/cell-<n>-<k>.<ext>`.
- **Download links:** every notebook page links `/notebooks/<path>.ipynb` (copied to `public/notebooks/`).
- **Indented code blocks:** MDX has none. The 2 that exist (tab-indented, in Micrograd notebook `4_2` cells 24 and 30) are converted to fences.

**Rendering differences vs MkDocs, checked by comparing every page with the `gh-pages` HTML:**
- 66 of 72 pages have identical counts of code blocks, images, tables, h2/h3 and list items.
- **Lists:** Python-Markdown requires a blank line before a list, CommonMark does not. Some lists that MkDocs printed as plain "- item" text inside a paragraph now render as real lists (Makemore 2C, 3A, 5; Micrograd MLP and value-object notes). This is clearly what the notes intended.
- **Books index:** the cards are Fumadocs Cards (h3 titles) instead of a list grid.
- **Accordions:** their headers render as h3.

**Repaired:** 14 nested links in `ZeroToHero/General-MISC/deepdive-llms.md` of the form `[text]([url](url))`. MkDocs rendered them with a broken `href="[url](url)"`, so they were dead links on the live site. The converter unwraps them to `[text](url)`. The source is unchanged.

**Notebook source location:** done at cleanup (see "MkDocs cleanup" below).

### Nav label vs old H1 (nav label is now the title)

| Source | Title (nav label) | Old H1 |
|---|---|---|
| `ZeroToHero/index.md` | Zero to Hero Series | Zero to Hero Series (with icon) |
| `ZeroToHero/Micrograd/index.md` | Micrograd | BACKPROPAGATION - Using an AutoGrad Engine |
| `ZeroToHero/Micrograd/notes/A-main-video-lecture-notes.md` | Master Notes | MASTER NOTES - NEURAL NETWORKS AND BACKPROPAGATION |
| `ZeroToHero/Micrograd/notes/crux-node-backpropagation.md` | Crux Node Backpropagation | Crux Node - Backpropagation |
| `ZeroToHero/Makemore-part1..5/index.md` | Makemore Part 1…5 | LANGUAGE MODEL - 1…5 (part 4: "… (BACKPROPAGATION II)") |
| `Makemore-part1/2 A/B/C-main-…md`, `Makemore-part3/A-…md` | Lecture Notes | SET A/B/C - LECTURE NOTES |
| `Makemore-part5/Main-makemore-part-5.md` | Lecture Notes | LECTURE NOTES |
| `ZeroToHero/GPT-1/index.md` | Transformer Model-1 | TRANSFORMER MODEL - GPT 1 |
| `ZeroToHero/GPT-2/index.md` | Transformer Model-2 | TRANSFORMER MODEL - GPT 2 |
| `ZeroToHero/GPT-Tokenizer/index.md` | Tokenizer | TOKENIZATION |
| `ZeroToHero/General-MISC/intro-llms.md` | Intro to LLMs | INTRODUCTION TO LLMs |
| `ZeroToHero/General-MISC/deepdive-llms.md` | Deep Dive into LLMs | DEEP DIVE INTO LLMs |
| `Books/index.md` | Overview | AI/ML Books |
| `Books/AI-Engineering/chapter-1/5/6-a/6-b.md` | (chapter nav labels) | AI Engineering by Chip Huyen |
| Notebooks `Makemore-part1/2 *-Notebook` | Jupyter Notebook | SET A/B/C - NOTEBOOK |
| Notebooks `GPT-2/section-*` | Section 0 / 1(a) / 1(b) / 2(a) | Section 0 / 1 - A / 1 - B / 2 - A |

- `GPT-1/bigram.md` has no H1, so nothing was removed there.
- The Books chapters lose their visible "AI Engineering by Chip Huyen" heading. The chapter title and the breadcrumb now carry the context.

### Typos / errors spotted in the notes (fixed after cleanup)

Fixed in prose, notebook markdown cells, code-cell comments (your approval), the "Neurons Explanation" title and two link labels. File names, URLs, link targets and heading ids are unchanged, so `neurons-explaination` and `pytorch-comparision` stay in the URLs. The `sItLL`/`SitLL` hits are model-generated names in saved outputs, not typos, and stay.

| Typo | Occurrences | Where |
|---|---|---|
| "explaination" | 16 | GPT-1, Makemore-part4 exercise-1; also the URL `notes/neurons-explaination`, kept for parity |
| "comparision" | 2 | Micrograd master notes; also the URL `notes/pytorch-comparision` |
| "withing" | 1 | Makemore-part1 B |
| "sitll" | 3 | Makemore-part1 A notebook, visualization-tools, GPT-2 2a |
| "duing" | 3 | GPT-2 2a |
| "thus time" (for "this time") | 1 | GPT-2 2a |
| "theoritical(ly)" | 3 | Micrograd 4_1/4_2, Makemore-part4 exercise-1 |
| "deriviti…" | 3 | Micrograd notebooks 2, 4_1, 4_2 |
| "seperately" | 2 | GPT-1 index, GPT-2 1a |
| "convered" | 1 | Micrograd index |
| "tagets" | 1 | GPT-2 1b |
| "recieve" | 3 | GPT-2 1b, Micrograd 6_0, 6_1 |
| "occured" | 2 | Makemore-part1 A notebook, GPT-2 1b |
| "calcualte" | 1 | Makemore-part4 exercise-1 |
| "dimention" | 1 | Makemore-part1 A notebook |

- The nested-link problem in `deepdive-llms.md` is described above.
- External image URLs in Micrograd notebooks 6_0/6_1 (`imgs.search.brave.com/...` proxy links) may stop working at any time; consider copying those images locally.

## Landing page (Phase 3)

- **Route:** `app/(home)/page.tsx` in the Fumadocs `HomeLayout`.
- **Navbar:**
  - Transparent while it is over the hero (`transparentMode: 'top'`).
  - Contents: logo + "Road to AI" (→ `/`), Neural Networks, Library, search, theme toggle and GitHub.
  - Navbar links live in `lib/layout.shared.tsx`.
- **Globe** (`components/home/globe.tsx`):
  - Packages: `vanta@0.5.24` (the latest release, 2022, and what `vanta@latest` resolved to on the old site) and `three@0.134.0`, the same r134 the old page loaded from cdnjs. Both come from npm and are pinned.
  - Loading: `next/dynamic` with `ssr: false` (`hero-globe.tsx`), so it is client-only. three.js + Vanta are one 622 KB chunk, loaded only on `/`.
  - Colours follow `useTheme().resolvedTheme` live via `setOptions`: dark is white on #121212, light is #121212 on white. The effect is destroyed on unmount.
  - With `prefers-reduced-motion: reduce`, no animation runs and the hero keeps a plain background.
  - Uses `touchControls` + `scaleMobile: 1`, as before.
- **Hero layout:** reproduces the old one. Content sits at 10% from the left with width `min(40%, 480px)`; on mobile it is 5% / 90%. It shows the light or dark logo and the tagline.
- **Below the hero:**
  - a scroll cue;
  - a placeholder intro with two Cards linking `/ZeroToHero/` and `/Books/`;
  - a footer with the copyright and GitHub.
  - Every placeholder is marked `TODO(landing)`.
- **Browser check:** reviewed by you after a hard refresh. The globe, the logo and the intro section all render as intended.

## Verification (Phase 4)

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ no errors |
| `npm run lint` (Biome) | ✅ 33 files, no diagnostics |
| `npm run build` | ✅ 75 HTML pages exported; warnings: only the 2 known Fumadocs CSS `::highlight` warnings |
| `npm run check:links` | ✅ 3,481 internal href/src/#anchor on 76 HTML files, 0 broken |
| `npm run check:parity` | ✅ 72/72 old URLs exist. Extra pages: only `/404/` and `/_not-found/`. 72 nav pages = 72 MDX pages = 72 sidebar entries. 0 MkDocs leftovers |
| Heading anchors | ✅ all 302 non-H1 heading ids of the old site exist (43 removed page-H1 ids land on the page top) |
| Structure vs `gh-pages` HTML | ✅ 66/72 pages identical in code blocks/images/tables/headings/lists; the 6 differences are explained above |
| Search (static index) | ✅ queried `out/api/search.json` with Fumadocs' own static-search code. "tfloat32" / "bfloat16" (only in the GPT-2 2a notebook), "wavenet", "retrieval augmented" and "manual gradient descent" all find the right pages |
| Rendered features (in HTML) | ✅ callouts, accordions, cards, tweet containers, GPT-2 flex image rows, notebook download link + output blocks, code-copy buttons, TOC (and hidden on the 4 chapters), prev/next links |
| Dark/light, mobile, dropdown, globe | ✅ reviewed by you in the browser (after the UI round below) |
| Nested links | ✅ 0 `<a>` inside `<a>` across all 76 exported HTML files |

## UI round after your review

| Change | Where |
|---|---|
| **Docs layout:** switched to Fumadocs **spacious** (as on fumadocs.dev). The sidebar is flush left (no gap), the page sits in a rounded panel, and the section dropdown is on top. | `app/(docs)/layout.tsx`, `app/(docs)/[...slug]/page.tsx` |
| **Spacious styles:** `preset.css` doesn't include the spacious layout's class list, so `app/global.css` imports `fumadocs-ui/css/generated/spacious.css`. Without it the docs rendered unstyled. | `app/global.css` |
| **Dropdown entries:** an icon plus a one-line description per section (Neural Networks → Brain, "Zero to Hero: from backprop to GPT"; Library → LibraryBig, "Notes from AI/ML books"). | root `meta.json` (hand-maintained since the cleanup; first generated from `ROOT_SECTIONS` in the removed `convert-pages.mjs`), `lib/sections.tsx` |
| **Section accents:** a subtle `--color-fd-primary` per section (indigo / amber, light and dark variants). It is set by a small `<style>` that each page emits (`SectionAccent`). An earlier `body:has()` version was replaced because it is re-evaluated while scrolling. | `lib/sections.tsx`, `app/global.css` |
| **Collapsed sidebar:** the classic layout's floating "open sidebar + search" pill is back. While collapsed, it hides spacious's own expand button and pads the breadcrumb. | `components/collapsed-sidebar-controls.tsx` |
| **TOC:** the classic style `'normal'` (thin line with a sliding indicator) instead of spacious's `'block'`. | `app/(docs)/[...slug]/page.tsx` |
| **Nested links fixed** (hydration warning). Headings that contain a link skip Fumadocs' self-link wrapper, and TOC entries get their links stripped. This covers the 80 "Timestamp: [..](youtube)" headings. | `components/mdx/heading.tsx` |
| **Landing:** the whole page uses the globe background (white / #121212), the intro section fills the viewport on desktop, and the cards use the section icons and colours. | `app/(home)/*`, `.landing-surface` |
| **Dev server:** `output: 'export'` only for builds, so `/sw.js` and Chrome's DevTools probe return 404 in dev instead of "missing param" errors. | `next.config.mjs` |

- **Performance:** if scrolling feels laggy, compare on the export (`npm run build && npx serve out -l 4173`); dev mode is always heavier. Vanta already stops rendering when the globe is off-screen.

## MkDocs cleanup

The scripts and paths in "Content conversion" above describe the migration as it happened. Since the cleanup:

| Change | Where |
|---|---|
| Notebooks moved with `git mv` from `docs/` to `notebooks/` (same relative paths). | `notebooks/` |
| Notebook titles come from `notebooks/titles.json` (path → title), built once from the frontmatter titles, instead of the `mkdocs.yml` nav. The converter fails on a missing or orphaned title. | `notebooks/titles.json`, `scripts/convert-notebooks.mjs` |
| Notebook images are no longer copied from `docs/assets`; the converter checks they exist in `public/`. | `scripts/lib/site.mjs` (`assertAsset`) |
| Notebook banner: "Generated from notebooks/…". Re-running `npm run notebooks` changed only that line. | 38 notebook MDX files |
| Page MDX files and every `meta.json` are hand-maintained. The "Generated from docs/…" banners are removed from the 34 pages. | `content/docs/` |
| Removed `scripts/convert-pages.mjs`, `scripts/lib/nav.mjs`, the `convert:pages` / `convert` npm scripts. | `scripts/`, `package.json` |
| `check:parity` no longer reads `mkdocs.yml`. It checks: old URLs exist; every MDX page and folder is listed in `meta.json`, and every `meta.json` entry exists; every notebook has a generated page, a title and an up-to-date `public/notebooks/` copy; no MkDocs leftovers (incl. old banners). | `scripts/check-parity.mjs` |
| `docs/CNAME` → `public/CNAME` (exported as `out/CNAME`). The README logo `main-page-logo-1.png` → `public/assets/images/`. | `public/` |
| Deleted `mkdocs.yml`, `overrides/`, `instructions.md` and the rest of `docs/` (stylesheets, javascripts, manifest, all of `docs/assets/` incl. unreferenced images and `blog-assets/`). They remain on `main` and in history. | |
| `.gitignore`: dropped `.cache` (MkDocs Material); kept `.venv/` (local Jupyter). | `.gitignore` |
| New `README.md` for the Fumadocs site; `CLAUDE.md` describes the post-cleanup workflow. | |

`.github/workflows/ci.yml` was left unchanged at cleanup and removed in the deployment task (see below).

## Status and next steps

1. **Done:** setup, content conversion, landing page, UI polish, verification scripts, MkDocs cleanup.
2. **Done:** typo fixes. **Next:** scroll-smoothness profiling.
3. **Done:** deployment workflow and cutover (below); PR #38 merged, first deploy green.
4. **Done:** post-launch wrap-up: this file and the MkDocs config moved to `archive/`, `MAINTAINING.md` added.
5. **Open:** scroll-smoothness profiling.

## Deployment: GitHub Pages via Actions

### Workflow

**`.github/workflows/deploy.yml`** replaces the MkDocs `ci.yml` (`mkdocs gh-deploy --force`), which was removed in the same branch so the two deployments never run together.

**Triggers:**
- `push` to `main`;
- `pull_request` to `main`;
- `workflow_dispatch`.

**`build` job** (every run):
1. checkout;
2. setup-node with `node-version-file: .nvmrc` and `cache: npm`;
3. `npm ci`;
4. typecheck → lint → build → check:links → check:parity, one step each (same order as the `&&` chain), so a failure points at its step;
5. `upload-pages-artifact` with `path: out` and `include-hidden-files: true`. It also runs on PRs, which exercises the step; the artifact expires after a day.

**`deploy` job:**
- runs only if `github.event_name != 'pull_request' && github.ref == 'refs/heads/main'`, so PRs and manual runs on other branches only build;
- `actions/deploy-pages` into the `github-pages` environment.

**Permissions:**
- `contents: read` at workflow level;
- `pages: write` + `id-token: write` only on the deploy job.

**Concurrency:**
- Main/manual runs share the group `pages` with `cancel-in-progress: false`. They run one after another, so an older build never deploys over a newer one, and an in-progress deploy is never cancelled.
- PR runs use a per-PR group, where a new push cancels the superseded build. A shared group would let a pending PR run replace a pending main deploy.

**Action versions** (latest releases checked on 2026-10-31 with `gh api repos/<action>/releases/latest`):

| Action | Pinned major | Latest release | Note |
|---|---|---|---|
| `actions/checkout` | `v7` | v7.0.1 | |
| `actions/setup-node` | `v7` | v7.1.0 | |
| `actions/upload-pages-artifact` | `v5` | v5.0.0 | since v4 dotfiles are excluded unless `include-hidden-files: true` (input added in v5) |
| `actions/deploy-pages` | `v5` | v5.0.1 | |

`actions/configure-pages` is not used: there is no `basePath` and Pages is already enabled.

### Files

- **`public/.nojekyll`** (empty) → `out/.nojekyll`. Actions deploys never run Jekyll, so `_next/` is served regardless; the file matters only for a branch deploy of `out/`. It is the only dotfile in `out/`.
- **`public/CNAME`** → `out/CNAME`. With Actions deploys, Pages takes the domain from the settings and ignores the file; it is kept as documentation and for branch deploys.

### How Pages serves the export (checked on `out/` and against `npx serve out`)

| Item | Check | Result |
|---|---|---|
| Directory URLs | All 73 URLs in `scripts/old-urls.txt` exist as `<dir>/index.html`. Pages serves `/a/b/` from `index.html` and 301-redirects `/a/b` → `/a/b/`. | ✅ |
| Unknown URLs | `out/404.html` exists and loads only root-absolute `/_next/static/…` assets, so it renders at any depth. Pages uses the top-level `404.html` (`custom_404` is already true). | ✅ |
| `/api/search.json` | 3.0 MB, parses as JSON. Served as `application/json` by extension, which is compressible. | ✅ |
| `/_next/` | `out/_next/static/` exists. Not affected by Jekyll (no Jekyll run, plus `.nojekyll`). | ✅ |
| PWA | `manifest.webmanifest` (served as `application/manifest+json`), both manifest icons, the favicon and the apple-touch-icon all exist in `out/`. | ✅ |

### Repository state found before the cutover (read-only API)

- **Pages:**
  - `build_type: legacy`, source `gh-pages` / root;
  - cname `docs.muhammedshah.com`;
  - HTTPS certificate approved (expires 2026-12-07) and enforced.
- **`github-pages` environment:** the deployment-branch policy allows **only `gh-pages`**. A deploy from `main` is rejected until `main` is added.

### Cutover checklist (completed 2026-10-31)

1. **Settings → Environments → `github-pages` → Deployment branches and tags:** add `main` and keep `gh-pages` (rollback needs it).
2. **Settings → Pages → Source: "GitHub Actions"**, right before merging. The current site stays up until the first Actions deployment replaces it. Check that the custom domain still reads `docs.muhammedshah.com` and "Enforce HTTPS" is on.
3. **Merge the PR.**
4. **Watch the "Deploy to GitHub Pages" run on `main`.** If it fails on a setting, fix the setting, then "Re-run failed jobs" or "Run workflow". No new commit is needed.
5. **Spot-check the live site:**
   - a few URLs from `scripts/old-urls.txt`, including a deep `#anchor`;
   - search;
   - a notebook page and its `.ipynb` download;
   - dark/light mode;
   - mobile;
   - HTTPS on the custom domain;
   - an unknown URL, which should show the 404 page.

### Rollback

1. **Settings → Pages → Source:** "Deploy from a branch", `gh-pages` / `(root)`. That branch still holds the last MkDocs build, so the old site is back within about a minute. No rebuild of the new site is needed.
2. **While rolled back, disable the workflow** (Actions → "Deploy to GitHub Pages" → Disable, or `gh workflow disable deploy.yml`), so pushes to `main` don't try to deploy.
3. **To go forward again:** set Source back to "GitHub Actions", enable the workflow, and run it with "Run workflow".
4. **Keep the `gh-pages` branch** and its entry in the environment policy until the new site has been stable for a while. Nothing writes to `gh-pages` any more.

## Deviations from the prompt

- **Fumadocs docs vs installed template:**
  - The manual-install docs show `source.config.ts`.
  - The scaffolded template (and the `fumadocs-mdx/macro` docs) use `defineDocs` from `fumadocs-mdx/macro` directly in `lib/source.ts`.
  - I followed the template.
- **Biome:** `create-fumadocs-app` does offer Biome (`--linter biome`); the docs page says only the separate CLI does.
- **Generated pages are also committed:** the prompt asked for generated notebook MDX to be committed. The converted Markdown pages are committed the same way, so `npm run build` needs no conversion step.
- **Search index path:** `/api/search.json` instead of the template's `/api/search` (see Static search).
- **Next 16 route-type cache:** after renaming or moving a route, `tsc` can fail on stale types in `.next/dev/types`. Run `rm -rf .next` once.

## Known warnings

- `next build`: "Found 2 warnings while optimizing generated CSS". `::highlight(fd-search)` is flagged by the CSS optimizer. The selector comes from Fumadocs UI's own CSS, so it is harmless.
- `npm audit`: 2 high, both in `serve` → `compression` (dev-only local preview server, never deployed).

## Findings in the old site (not changed)

- **Empty sitemap:** the live `sitemap.xml` has no URLs because `mkdocs.yml` has no `site_url`. `scripts/old-urls.txt` was therefore built from the deployed `origin/gh-pages` tree: 73 pages.
- **`extra_css` declared twice in `mkdocs.yml`:** YAML keeps the last one, so `stylesheets/custom.css` was only loaded by the landing page's inline script.
