# Madelyn Rega — Personal Portfolio: build brief for Claude Code

Build Madelyn Rega's portfolio site as a fast, static, accessible website. Everything here is final and approved in Claude Design. Match it closely: copy, structure, interactions and look. Where this brief and the reference file disagree, this brief wins.

## 1. What the site is for

- **Owner:** Madelyn Rega, MHCI. She is a researcher, designer and advocate, and a Product Owner on healthcare EMR software.
- **Audience:** first, PhD admissions committees (her first choice is Northwestern's Technology and Social Behavior PhD). Second, employers. An academic lean is fine.
- **Core idea:** the **Gallery of Work** is a theme map. Every project, role, course and volunteer position is an *item*, and items connect through shared *themes*. Selecting a theme rearranges the map around it, and selecting an item previews it. She plans to add a recommendation algorithm later, so keep the "related items" logic in one replaceable module.

## 2. What's in this folder

```
CLAUDE.md                     ← this brief
content/
  site.md                     ← site-wide copy: hero, contact, CVs, About page
  themes.md                   ← the 26 themes, with category and description
  items/NN-id-slug.md         ← one file per item (52), frontmatter + body sections
data/site.json                ← build snapshot: items, themes, cloud layout (word positions/sizes)
design/
  reference-design.dc.html    ← the approved Claude Design file (it won't run on its own)
  styles.css                  ← the reference CSS, extracted and reusable as-is
  reference-logic.js          ← the reference JS: theme-map layout, recommender, state
assets/
  img/hero-crt.webp (+ .jpg)  ← home hero background
  img/camera-frame.png        ← transparent camera that frames the preview modal
  img/icons/*-ink.png | *-white.png  ← pixel nav icons (ink = inactive, white = active)
  img/projects/*              ← project images (see item frontmatter `media`)
  img/about/*                 ← postcard photos
  cv/*.pdf                    ← CV downloads
```

**Source of truth:** `content/`. Madelyn edits Markdown, so the site must read `content/items/*.md`, `content/themes.md` and `content/site.md` at build time. `data/site.json` is a snapshot used for its `cloud` positions (see §6.2). After that, generate everything else from Markdown.

## 3. Stack (recommended)

- **Astro** with content collections (Markdown + a typed frontmatter schema), deployed as a static site (Vercel, Netlify or GitHub Pages).
- **The interactive parts** (theme map, preview modal, carousel, postcards, nav active state) are small client-side islands written in vanilla TS or Preact. No heavy UI framework.
- **Fonts:** Google Fonts, self-hosted via `@fontsource` if possible:
  - Archivo (variable, `wdth` 62–125, `wght` 300–800)
  - IBM Plex Mono 500
  - Silkscreen 400
  - Caveat 500/600
- **Validation:** a Zod schema for item frontmatter. The build fails on an unknown theme name or category, a missing required field, or a media file that doesn't exist.

If Madelyn asks for a different stack, keep the same content model and routes.

## 4. Routes

| Route | What it shows |
|---|---|
| `/` | Hero, then the Gallery of Work theme map. `/#gallery` scrolls to the map. |
| `/work/[slug]` | Item page, one per item (all 52). |
| `/experience` | Every item, grouped Work / School / Volunteer, then by subgroup. |
| `/about` | Contact section (`#contact`) first, then "Off the clock" (`#about-me`). |
| `/?theme=<theme-slug>` | Optional deep link: opens the gallery focused on that theme. |

- **Navigation dock order:** Home (`/`), Gallery (`/#gallery`), Experience, Contact (`/about#contact`), About (`/about#about-me`).
- **Active state:** on `/`, Home vs Gallery depends on scroll. The gallery counts as active once its top passes 40% of the viewport. Other pages set the active item by route. The active item uses the white icon on an ink pill. Inactive items use the ink icon.
- The reference prototype is a single page that swaps views in state; the real site uses the real routes above. Keep a "Back" button on item pages. It goes to the previous page in history, or to `/#gallery` if there is none.

## 5. Content model

### Item frontmatter (`content/items/*.md`)
`id, order, tier, title, short_label, slug, setting, group, subgroup, type, organization, role, dates, summary, topics[], methods[], tools[], strengths[], metrics[], media[{src, caption, fit}], internal_notes`

- `order` is the impact ranking: lower numbers come first. Sort by it everywhere, but **never display it**. No numbering anywhere on the site.
- `tier`: Featured (10 items), Core or Supporting.
  - Featured items appear in the default gallery cloud with a lime dot, and get a "Featured" badge on their page.
- `short_label` is used on the map, where long titles don't fit.
- **Body sections:** three `##` sections. The heading names depend on the item type:
  - research: Question / Methods / Findings
  - coursework or degree: Covers / Practiced / Outcome
  - volunteer: Need / Contribution / Impact
  - everything else: Problem / Process / Result

  Render whichever sections exist, in order.
- `internal_notes` is never rendered.
- **Placeholders:** any value or section that starts with `[` is a TODO.
  - Don't render it. Hide the field or section.
  - Print a build warning listing every placeholder.
  - Never ship bracketed text.

### Themes (`content/themes.md`)
26 themes in 4 categories. Theme names must match the item tags exactly.
- Topics (11)
- Methods (7)
- Tools & skills (3)
- Strengths (5)

The count of items per theme is computed at build time.

## 6. Pages and components

### 6.1 Header and footer
- **Header:** a floating, narrow chrome bar.
  - `max-width:1080px`, centered, sticky at `top:10px`, height 60px, `border-radius:8px`.
  - It overlays the page (the header itself is 0px tall), so the hero runs full-bleed behind it.
  - Left: logo = lime dot + "MR" in IBM Plex Mono. It links home.
  - Right: the nav dock.
  - On mobile (≤760px) the nav labels hide and only icons show.
- **Footer:** the same chrome bar, centered, with "© Madelyn Rega" and a "Back to top ↑" ink button.
- Light pages start with `padding-top:110px` so content clears the floating header.

### 6.2 Home: hero
- Full-bleed `hero-crt.webp`, `background-position:30% 50%`, `min-height:clamp(660px,100vh,920px)`.
- Bottom gradient to solid `#0f1015`, so the hero fades seamlessly into the gallery: `linear-gradient(180deg, transparent 50%, rgba(15,16,21,.75) 85%, #0f1015 100%)`.
- **Lime speech bubble** with a 4-step pixel tail pointing left toward the TV's mouth.
  - Right-aligned, `margin-right:clamp(16px,1.6vw,28px)`, width up to 560px. The bubble must not cover the mouth.
  - Text: "Hi, welcome to my work." with a blinking block caret.
  - Below the bubble: "Madelyn Rega, MHCI" and "innovator, researcher, designer, advocate".
- "Scroll to explore ↓" cue at the bottom left, scrolling to `#gallery`.

### 6.3 Home: Gallery of Work (theme map)
Keep this section **Y2K digital**: solid ink background with a faint dot grid (`radial-gradient(rgba(255,255,255,.07) 1px, transparent 1.2px) 0 0/22px 22px`).

**Header row**
- Left: pixel eyebrow "Themes · experiences · connections" and the heading "Gallery of Work".
- Right: **filter** buttons, set in the pixel font. Single-select: All · Topics · Methods · Tools & skills · Strengths · Featured work. Each has a colored dot.
- No default helper text. Only when a theme is focused, show its category · "N connected", its name and its description, plus a "Show everything" button.

**Map container**
- `position:relative; height:clamp(640px,62.5vw,900px); max-width:1440px`.
- Every theme (26) and every item (52) is an absolutely positioned button, centered on its `x,y` (percent) with `translate(-50%,-50%) scale(var(--s))`.
- Animate `left`, `top`, `opacity`, `transform` and `font-size`: 0.75s, `cubic-bezier(.2,.8,.2,1)`, with a small per-item stagger (`transition-delay`) of 0–250ms.
- Hidden items get `pointer-events:none`, `tabindex=-1` and `aria-hidden`.

**Default (no focus): word cloud**
- Themes and the 10 Featured items sit at the positions and font sizes in `data/site.json → cloud` (`x`, `y` are center points in %, `fs` is px at 1440 wide).
- Font size: `min(fs*1px, fs*0.0694vw)`.
- Theme text style by category:
  - Topic: white, bold, extended Archivo
  - Method: soft pink `#ffc9e3`
  - Tools: light gray italic
  - Strengths: muted gray `#b4bac7`
- Featured items: IBM Plex Mono with a glowing lime dot.
- Non-featured items are hidden at the center.
- When `dimOthers` is on, hovering one word dims the rest to 40%.

**Focused on theme T:** the map rearranges into a radial layout. Port `layout()` from `design/reference-logic.js` as-is.
- **Center:** T, at 26px, as a chrome pill (ink text) with a dashed ring. Clicking it resets the map.
- **Connected items** (items tagged T), sorted by `order`:
  - The first 8 go on an inner ellipse, `rx=20%, ry=24%`.
  - The rest go on an outer ellipse, `rx=33%, ry=37%`, offset by half a step.
  - They render as small glass pills (`max-width:180px`, wrapping); featured ones get a lime border.
- **Related themes:** up to 12 themes that co-occur most often with T go on an outer ring, `rx=45%, ry=44%`.
  - Coordinates are clamped to x 9–91% and y 5–95%.
  - Clicking one re-centers the map on it.
- Everything else fades out in place.
- **Lines:** an SVG overlay (`viewBox 0 0 100 100`, `preserveAspectRatio=none`, `vector-effect:non-scaling-stroke`) draws a line from the center to each connected item. It fades in after a 0.55s delay so the lines arrive with the moving items.

**Filters**
- *Topics / Methods / Tools / Strengths:* only themes of that category are shown, and when focused, only those appear in the related-theme ring.
- *Featured work:* only featured items are shown, and when focused, only featured connected items, with no theme ring.
- *All:* resets the filter.

**Clicks**
- Theme → focus the map on it.
- Item → open the preview modal.

### 6.4 Preview modal (camera)
- Scrim at `rgba(15,16,21,.78)` with an 8px blur.
- `camera-frame.png` at `width:min(1000px,94vw)`, aspect 971/614.
- **Screen area:** `left:8.4%; top:13.9%; width:60.2%; height:79.8%`. It's a pearl gradient panel with a 2px ink border and scrolls internally.
- **Screen contents, top to bottom:**
  1. setting · type (mono)
  2. title
  3. organization · dates
  4. if the item has media: a thumbnail of the first image beside the summary; otherwise the summary alone
  5. "Open the full page →" ink button
  6. theme chips
  7. "Related work": 3 rows
- **Every click inside opens something:**
  - "Open the full page" and the related rows → `/work/[slug]`.
  - Theme chips → close the modal, scroll to the map and focus that theme.
- **Close:** a "Close · Esc" button (it gets focus on open), the Esc key, or clicking the scrim. Trap focus inside while open. When it closes, return focus to the item that opened it.
- **Mobile (≤760px):** hide the camera image; the screen becomes a normal full-width panel.

### 6.5 Item page `/work/[slug]`
- **Top:**
  - "← Back" chrome button
  - setting · type
  - "Featured" badge (ink pill with a lime dot) if featured
  - title, as the H1
  - organization · role · dates
- **Two-column row, when the item has media:**
  - Left: the summary as the lede, plus metric pills.
  - Right: the media in a glass figure.
    - One image → a single image with a caption.
    - Several images → a carousel: chrome ← → buttons, dots with `aria-pressed`, and a caption that changes per slide.
    - `object-fit` comes from the media's `fit`.
  - Without media, the lede takes the full width.
- **Sections:** the body sections as glass cards in an auto-fit grid (`minmax(280px,1fr)`), each with a mono label.
- **Themes block:** a glass card with "Themes" and one row per category (Topics, Methods, Tools & skills, Strengths). Chips link to `/?theme=<slug>#gallery`.
- **Related work:** 3 cards from the recommender.

**Items that currently have media**
- **S4, EIC:** `eic-figure-1.png`.
- **S10, NHANES:** `nhanes-bmi-by-sedentary-level.png`.
- **S5, Pantry Partner:** five images, in this order: cover, screens, features-1, features-2, values.

### 6.6 Experience `/experience`
- **Header** (one row): "Experience" as the H1 on the left; chrome jump buttons on the right: Work, School, Volunteer. No counts and no intro sentence.
- **Groups**, each a section with a chrome heading band showing the group name and a one-line blurb:
  - **Work:** Roles, then "Product, design & research case studies".
  - **School:** Research & projects, then Degrees & credentials, then Coursework.
  - **Volunteer:** Service & advocacy.
- **Cards:** glass cards in an auto-fill grid (`minmax(300px,1fr)`), sorted by `order`. Each card shows:
  - type · dates (mono)
  - title (extended Archivo)
  - summary, clamped to 3 lines
  - the first 3 tags (non-interactive)

  Clicking a card goes to its item page. On hover, a card shifts −2px with a hard 4px ink shadow.

### 6.7 About `/about`
All copy is in `content/site.md`.
- **Contact (`#contact`):**
  - Eyebrow "Contact", H1 "Let's talk", the lede.
  - **Left glass card:** her name; email (mailto); LinkedIn (new tab, `rel="noopener noreferrer"`); "Download" with two CV links, each with a `download` attribute and "PDF ↓".
  - **Right glass card:** a form with Name, Email, Message and "Send message →".
    - **For now:** submit builds a `mailto:` with subject `Portfolio message from <name>` and the message plus the sender's name and email in the body.
    - **Recommended:** connect Formspree or Netlify Forms so submissions arrive without the visitor's email app. Add a honeypot field and success/error states. Ask Madelyn which service she wants before connecting one.
- **Off the clock (`#about-me`):**
  - Eyebrow "About", H2 "Off the clock", the lede.
  - **Three postcards** in a row (2 columns at ≤900px, 1 at ≤560px).
    - Each is a `<button>` with `aria-pressed`, aspect ratio 3:4, and a white 8px border.
    - The front is the photo, using the `focal_point` from `site.md` as `object-position`, with a small "Flip ↻" pixel badge.
    - Click flips it in 3D (`rotateY(180deg)`, 0.8s; slight tilt on hover).
    - The back is cream paper `#f7f4ec`:
      - Left: the caption in handwritten Caveat, ink-blue `#1d2a52`.
      - Divider line.
      - Right: a lime stamp with "MR" and a dashed inner edge, a rotated round postmark with the month, and three address lines.
  - **Three equal-width, equal-height glass cards:**
    - "Things I love to do": tag chips that cycle through the category colors.
    - "Bucket list": square checkboxes. Done items get a lime checked box and a strike-through, and have "Done:" text for screen readers.
    - "Recent favorites": Book / Movie / Views, each as a small label over an extended-Archivo value.

## 7. Design system
Reuse `design/styles.css`; it has the exact values.

**Aesthetic:** Y2K / Gen X Soft Club balanced with professionalism. That means:
- silver chrome
- frosted glass
- an iridescent pearl tint
- a lime accent
- pixel details
- near-square corners

**Colors**
| Token | Value | Use |
|---|---|---|
| `--ink` | `#0f1015` | dark sections, text on light pages, primary buttons |
| `--accent` | `#D7FF3F` (lime) | speech bubble, Topic tags, featured dots, stamp, checked boxes, focus rings on dark |
| `--pearl` / light page bg | `linear-gradient(180deg,#f4f5f8,#e7e9ee)` | light pages |
| `--muted` | `#5b6070` | secondary text |
| `--iri` | `linear-gradient(115deg,#ffd9ec 0%,#fff1cf 45%,#d6fbef 100%)` | Method chips (iridescent tertiary) |
| map method text | `#ffc9e3` | Method labels on the dark map |

**Tag and chip colors by category**
- **Topic:** lime fill.
- **Method:** iridescent fill.
- **Tools & skills:** white with a 1px ink outline.
- **Strengths:** silver gradient (`#fafbfd → #d6dbe3`).

**Silver ("chrome"):** for bars, heading bands, chrome buttons and the centered theme.
```
background:
  linear-gradient(104deg,rgba(255,255,255,0) 28%,rgba(255,255,255,.55) 44%,rgba(255,255,255,0) 58%),
  linear-gradient(180deg,#fbfcfe 0%,#e8ebf1 22%,#d0d5de 46%,#bfc5d0 52%,#d9dde5 70%,#f1f3f7 100%);
box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 rgba(15,16,21,.22);
```
It must read as polished silver, not flat gray. Keep the soft horizon and the diagonal sheen.

**Glass cards:** `rgba(255,255,255,.62)`, a 1px white border, `backdrop-filter:blur(14px)`, an inset highlight, a soft shadow, a 3px silver top edge on clickable cards, and `border-radius:6px`.

**Corners:** near-square (2–8px). No pill-shaped (fully rounded) buttons or chips, except the circular logo dot and the postmark.

**Type**
| Role | Font |
|---|---|
| Display / headings (`.display`) | Archivo 700, `font-stretch:125%`, letter-spacing −0.02em |
| Body | Archivo 400/500 |
| Labels and metadata (`.mono`) | IBM Plex Mono 500, 12px, uppercase, tracking .06em |
| Digital details (`.pixel`) | Silkscreen 400: gallery eyebrow, filters, the postcard "Flip" badge, stamp and postmark |
| Handwriting | Caveat 600, postcard backs only |
| Map theme labels | Archivo at `font-stretch:106%`, so the cloud spacing still fits |

**Motion:** the speech bubble and tail pop in with stepped easing; the caret blinks; the scroll cue bobs; the map transitions; the postcards flip. Respect `prefers-reduced-motion`: turn off animations and transitions, and show the map lines immediately.

## 8. Recommender ("related work")
In `reference-logic.js → related(n, k)`. Score each other item by its shared themes, where each shared theme adds `1 / log2(1 + count(theme))`, so rarer themes weigh more. Subtract `order × 0.002` as a tiebreak, drop scores ≤ 0, and take the top *k* (3). Keep this in its own module (`lib/related.ts`) so Madelyn can swap in a better algorithm later.

## 9. Accessibility and quality bar
- Use semantic landmarks, one H1 per page, and visible `:focus-visible` rings: lime on dark, ink on light.
- Everything works by keyboard: map buttons, filters, modal (Esc, focus trap), carousel, postcards.
- Live region (`aria-live="polite"`) on the focused-theme info.
- Alt text: project images use their captions; postcard alt text is in `site.md`; decorative images (camera, icons, hero) use `alt=""`.
- Text contrast meets WCAG AA.
- **Responsive:** breakpoints at 900, 760 and 560px.
  - Mobile map: height 780px, smaller font sizes (`max(12px, fs*0.5px)`).
  - Item page and contact grids collapse to one column.
- **Performance:**
  - Images in WebP, with `loading="lazy"` except the hero.
  - Width and height set on images.
  - Lighthouse ≥ 95 for accessibility, best practices and SEO.
- **SEO:**
  - Title and description per page.
  - Open Graph image: generate one from the hero.
  - `sitemap.xml` and `robots.txt`.

## 10. Privacy and NDA rules (non-negotiable)
- **Never name her employer anywhere on the site** (in copy, metadata, alt text or code comments). Product Owner work is described only as "Healthcare EMR software".
  - The CV PDFs she chose to publish do name it. That's her decision; leave the PDFs as they are.
- **Product Owner case studies** (Work items P*, D*, plus W1) describe **methods only**: no product features, field names, customers, collaborators or numbers. Don't add detail beyond what's in the Markdown.
- **No phone number, GPA or transcript details** in site copy.
- **CASA:** keep it general. No details about the children or the case.
- **Teammates and co-authors:** don't add their names unless Madelyn provides them.

## 11. Open items (ask Madelyn; until then, hide)
These are the bracketed placeholders (the build warns about them):
- **S9, Pioneers of Assistive Communication Technologies:** course and date.
- **V1, CASA:** start date and impact (general terms).
- **V2, Lekotek:** impact.
- **V3, Team Libertad:** impact.
- **D8, Scheduling tool:** problem, process and result (keep general for the NDA).
- **Course outcomes:**
  - C4 Prototyping in HCI
  - C6 Design and Ethics
  - C7 Visual Design of HCI
  - C11 Research Design & Data Analysis (the study and its findings)
  - C13 Psychology of the Atypical Child
  - C14 Multicultural Issues
  - C15 Philosophy & ethics of technology (a paper or argument)
- **Dates missing (empty, not bracketed):** S3 Public Health Data Visualization, V2 Lekotek, V3 Team Libertad, E3 Google UX certificate.

**Also needed before launch:**
- **More project images:**
  - Digital Defender wireframes
  - SDOH model charts
  - visuals from the 988 ethnography or the ABA interview study
- **Form service:** her choice (Formspree or Netlify Forms) and its key.
- **Domain and hosting.**

## 12. Acceptance checklist
- [ ] All 52 items render from Markdown. Editing a `.md` file and rebuilding updates the site.
- [ ] No bracketed placeholder text and no displayed ranks or numbering anywhere.
- [ ] Theme map: cloud by default; theme click → animated radial layout with lines; center click and "Show everything" reset; filters work in both states; item click → camera modal.
- [ ] Every clickable thing in the modal navigates (item page, related item, or theme focus).
- [ ] Item pages: back button, media (single or carousel), sections, grouped theme chips, 3 related items.
- [ ] Experience: simple header with jump buttons at top right; Work / School / Volunteer groups; cards open item pages.
- [ ] About: contact card with working mailto, LinkedIn and both CV downloads; working form; flipping postcards; three equal-height cards; Angels Landing shown checked.
- [ ] The floating chrome header and footer are narrower than the page (≤1080px), and the hero fades seamlessly into the dark gallery.
- [ ] The employer's name appears nowhere in the HTML output (grep the build).
- [ ] Keyboard-only and screen-reader pass; reduced motion respected; mobile at 375px looks right.
