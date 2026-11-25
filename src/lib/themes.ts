// Reads content/themes.md at build time. Theme names here must match item tags exactly.
import fs from 'node:fs';
import path from 'node:path';

export type Cat = 'Topic' | 'Method' | 'Tools & skills' | 'Strengths';
export type Theme = { name: string; cat: Cat; desc: string; slug: string };

export const CATS: Cat[] = ['Topic', 'Method', 'Tools & skills', 'Strengths'];
export const CAT_LABEL: Record<Cat, string> = { Topic: 'Topics', Method: 'Methods', 'Tools & skills': 'Tools & skills', Strengths: 'Strengths' };
export const CAT_CLS: Record<Cat, string> = { Topic: 'topic', Method: 'method', 'Tools & skills': 'tools', Strengths: 'strengths' };

const HEADING_TO_CAT: Record<string, Cat> = { Topics: 'Topic', Methods: 'Method', 'Tools & skills': 'Tools & skills', Strengths: 'Strengths' };

export const themeSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function load(): Theme[] {
  const md = fs.readFileSync(path.resolve('content/themes.md'), 'utf8');
  const out: Theme[] = [];
  let cat: Cat | null = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      cat = HEADING_TO_CAT[h[1]] ?? null;
      if (!cat) throw new Error(`themes.md: unknown category heading "${h[1]}"`);
      continue;
    }
    const m = line.match(/^-\s+\*\*(.+?)\*\*(?:\s*\([^)]*\))?\s*:\s*(.*)$/);
    if (m && cat) out.push({ name: m[1].trim(), cat, desc: m[2].trim(), slug: themeSlug(m[1].trim()) });
  }
  if (!out.length) throw new Error('themes.md: no themes found');
  return out;
}

export const THEMES: Theme[] = load();
export const THEME_BY_NAME = new Map(THEMES.map((t) => [t.name, t]));
