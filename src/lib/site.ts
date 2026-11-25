// Reads content/site.md at build time: site-wide copy, contact and the About page.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export type Postcard = { photo: string; focal_point: string; alt: string; caption: string; postmark: string };
export type Site = {
  name: string;
  tagline: string;
  hero_bubble: string;
  email: string;
  linkedin: string;
  cv: { label: string; file: string }[];
  contact: { eyebrow: string; heading: string; lede: string; form_note: string };
  about: { eyebrow: string; heading: string; lede: string };
  postcards: Postcard[];
  loves: string[];
  bucket: { text: string; done: boolean }[];
  favorites: { label: string; value: string }[];
};

const stripComment = (s: string) => s.replace(/\s+#\s.*$/, '').trim();

function keyValues(block: string) {
  const o: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (m) o[m[1]] = stripComment(m[2]);
  }
  return o;
}

function sections(body: string, level: number) {
  const re = new RegExp(`^${'#'.repeat(level)}\\s+(.+)$`, 'gm');
  const out: Record<string, string> = {};
  const hits = [...body.matchAll(re)];
  hits.forEach((h, i) => {
    const start = h.index! + h[0].length;
    const end = i + 1 < hits.length ? hits[i + 1].index! : body.length;
    out[h[1].trim()] = body.slice(start, end);
  });
  return out;
}

const bullets = (block = '') =>
  block.split(/\r?\n/).filter((l) => /^-\s+/.test(l)).map((l) => l.replace(/^-\s+/, '').trim());

function load(): Site {
  const raw = fs.readFileSync(path.resolve('content/site.md'), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fm) throw new Error('site.md: missing frontmatter');
  const front = YAML.parse(fm[1]);
  const body = fm[2];
  const h2 = sections(body, 2);
  const contactKey = Object.keys(h2).find((k) => k.startsWith('Contact'))!;
  const aboutKey = Object.keys(h2).find((k) => k.startsWith('About'))!;
  const contact = keyValues(h2[contactKey].split(/^###/m)[0]);
  const aboutBlock = h2[aboutKey];
  const about = keyValues(aboutBlock.split(/^###/m)[0]);
  const h3 = sections(aboutBlock, 3);
  const pick = (prefix: string) => h3[Object.keys(h3).find((k) => k.startsWith(prefix)) ?? ''] ?? '';

  const postcards = YAML.parse(pick('Postcards')) as Postcard[];
  const loves = bullets(pick('Things I love'));
  const bucket = bullets(pick('Bucket list')).map((b) => {
    const m = b.match(/^\[( |x|X)\]\s*(.*)$/);
    return m ? { text: m[2], done: m[1].toLowerCase() === 'x' } : { text: b, done: false };
  });
  const favorites = bullets(pick('Recent favorites')).map((b) => {
    const i = b.indexOf(':');
    return { label: b.slice(0, i).trim(), value: b.slice(i + 1).trim() };
  });

  const required = ['eyebrow', 'heading', 'lede'];
  for (const k of required) {
    if (!contact[k]) throw new Error(`site.md: Contact is missing "${k}"`);
    if (!about[k]) throw new Error(`site.md: About is missing "${k}"`);
  }
  for (const p of postcards) {
    if (!fs.existsSync(path.resolve('public' + p.photo))) throw new Error(`site.md: postcard photo not found: ${p.photo}`);
  }
  for (const c of front.cv) {
    if (!fs.existsSync(path.resolve('public' + c.file))) throw new Error(`site.md: CV file not found: ${c.file}`);
  }

  return {
    ...front,
    contact: { eyebrow: contact.eyebrow, heading: contact.heading, lede: contact.lede, form_note: contact.form_note ?? '' },
    about: { eyebrow: about.eyebrow, heading: about.heading, lede: about.lede },
    postcards,
    loves,
    bucket,
    favorites,
  };
}

export const SITE: Site = load();
