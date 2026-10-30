# Archive: the MkDocs era and the move to Fumadocs

Nothing in this folder is used by the site. It is kept for reference.

| Path | What it is |
|---|---|
| `MIGRATION_NOTES.md` | The detailed log of the migration: decisions, conversion rules, verification results, the deployment and its cutover. |
| `mkdocs/` | The MkDocs Material configuration and theme files, copied from the last MkDocs commit on `main` (`f58d881`, "PWA iOS icon implementation"). |

## What `mkdocs/` contains

Paths mirror the old repository layout:

- `mkdocs.yml`: site config, nav, theme, Markdown extensions and plugins (`mkdocs-material`, `mkdocs-jupyter`, `mkdocs-macros`).
- `overrides/main.html`: the theme override.
- `docs/index.md`: the old landing page (Vanta globe via cdnjs).
- `docs/stylesheets/`, `docs/javascripts/`: the custom CSS and the X/Twitter embed script.
- `docs/manifest.webmanifest`: the old PWA manifest.
- `instructions.md`: how to run the old site locally (Python venv + `mkdocs serve`).
- `.github/workflows/ci.yml`: the old deploy workflow (`mkdocs gh-deploy --force` to the `gh-pages` branch). It is a hidden folder in Finder (`Cmd+Shift+.` shows it). GitHub only runs workflows from the repository's root `.github/`, so this copy never runs.

**Not copied:**
- The old page sources (`docs/**/*.md`, about 5 MB). They live on as `content/docs/**/*.mdx`.
- The notebooks. They live on in `notebooks/`.
- `docs/assets/` (120 MB, including `blog-assets/`).

All of it is still in git history.

## How to see the whole old site

- **Built HTML:** the `gh-pages` branch holds the last MkDocs build (`704d615`, "Deployed f58d881 with MkDocs version: 1.6.1"). Nothing writes to it any more.
- **Source:**
  1. `git switch --detach f58d881` (or browse https://github.com/MuzzammilShah/Road-to-AI/tree/f58d881).
  2. Follow `instructions.md`.
  3. When you are done, `git switch main`.
- **Put the old site back live:**
  1. Settings → Pages → Source: "Deploy from a branch", `gh-pages` / `(root)`.
  2. Disable the "Deploy to GitHub Pages" workflow while it is live. See "Rollback" in `MAINTAINING.md`.

## Summary of the migration (2026-10-30 → 2026-10-31)

**Why:** Material for MkDocs reaches end of life in May 2027. The site moved to Fumadocs (Next.js 16, Tailwind 4) as a fully static export, keeping every URL.

**How it went:** all work happened in a separate git worktree on the branch `major-update/framework-switch`, merged as PR #38.

| Step | What happened |
|---|---|
| Phase 0: plan | Inventory of the old site; 73 live URLs recorded in `scripts/old-urls.txt` from the `gh-pages` tree (the old sitemap was empty). |
| Phase 1: base | Fumadocs static template, exact version pins, Biome, Orama static search at `/api/search.json`. |
| Phase 2: content | 34 Markdown pages and 38 notebooks converted to MDX by scripts. Admonitions became Callouts and Accordions, icon shortcodes became Lucide icons, and the nav became `meta.json` files. Old heading ids were kept as explicit ids, so `#anchor` links keep working. 14 broken nested links were repaired. |
| Phase 3: landing | New landing page with the Vanta globe, rebuilt from npm packages (no CDN). |
| Phase 4: checks | `check:links` (every internal link, image and anchor resolves) and `check:parity` (all old URLs exist, sidebar = content, notebooks up to date). |
| UI round | Spacious docs layout (as on fumadocs.dev), per-section accent colours, the classic collapsed-sidebar pill and TOC, fixes for nested links and hydration. |
| Cleanup | MkDocs files removed. `content/docs/` (MDX) and `notebooks/` became the only sources, and the page converter was retired. |
| Typos | 43 spelling fixes across notes and notebooks. URLs kept unchanged. |
| UI fixes | Mobile hero, tables, Books icon, landing footer and cards. |
| Deployment | `.github/workflows/deploy.yml` (GitHub Actions → Pages) replaced the MkDocs `ci.yml`. Cutover on 2026-10-31: `main` allowed in the `github-pages` environment, Pages source switched to "GitHub Actions", PR #38 merged, first deploy green. |
| Wrap-up | This archive, `MAINTAINING.md` (how to add pages, notebooks and sections), and updated docs. |

**Results at launch:**
- 72 of 72 old page URLs serve the new site, and all 302 old heading anchors exist.
- 76 exported pages; 3,401 internal links, images and anchors, with 0 broken.
- The custom domain and HTTPS are unchanged.
