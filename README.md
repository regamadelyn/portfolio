# Madelyn Rega — Portfolio

A fast, static, accessible portfolio built with [Astro](https://astro.build). The **Gallery of Work** is a theme map: every project, role, course and volunteer position is an item, and items connect through shared themes.

## Editing content

Everything on the site comes from Markdown in `content/`:

| File | What it controls |
|---|---|
| `content/items/*.md` | One file per item (frontmatter + `##` body sections) |
| `content/themes.md` | The 26 themes, their category and description |
| `content/site.md` | Hero, contact details, CV links and the About page |
| `data/site.json` | Word-cloud positions for themes and featured items |

Edit a file, push to `main`, and the site rebuilds and redeploys automatically.

- **Placeholders:** any value or section that starts with `[` is treated as a TODO. It is hidden on the site and listed as a warning when the site builds.
- **Validation:** the build fails on an unknown theme, category or subgroup, a missing required field, or a media file that doesn't exist.
- `internal_notes` is never shown on the site, but this repository is public, so anyone can read it here. Keep private notes in `NOTES-private.md`, which is git-ignored.

## Running it locally

Requires Node.js 22.23+.

```sh
npm install
npm run dev      # http://localhost:4321/portfolio/
npm run build    # builds to dist/ and runs the post-build checks
```

`npm run build` also checks the output for leftover placeholder text and, if a local `.nda-terms` file (git-ignored, one term per line) or an `NDA_TERMS` secret is present, for terms that must never appear on the site.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. The site is served at `https://regamadelyn.github.io/portfolio/`.

For a custom domain later, set `SITE_URL` and `BASE_PATH=/` (see `astro.config.mjs`).

## Code map

- `src/lib/related.ts` — the "Related work" recommender (swap in a better algorithm here)
- `src/lib/layout.ts` — theme-map layout (cloud and radial focus)
- `src/scripts/gallery.ts` — map interactions and the camera preview modal
- `src/content.config.ts` — item frontmatter schema
- `CLAUDE.md` — the full design and build brief
