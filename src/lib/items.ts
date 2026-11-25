// Turns content/items/*.md into the shape the pages use.
// Placeholders (any value or section starting with "[") are hidden and listed as build warnings.
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { THEME_BY_NAME, type Cat } from './themes';
import { related, themeCounts } from './related';

export type Tag = { name: string; cat: Cat };
export type Media = { src: string; caption: string; fit: 'cover' | 'contain' };
export type Section = { k: string; paras: string[] };
export type Item = {
  id: string;
  order: number;
  tier: 'Featured' | 'Core' | 'Supporting';
  featured: boolean;
  title: string;
  short: string;
  slug: string;
  setting: 'Work' | 'School' | 'Volunteer';
  group: 'Work' | 'School' | 'Volunteer';
  sub: string;
  type: string;
  org: string;
  role: string;
  dates: string;
  summary: string;
  tags: Tag[];
  metrics: string[];
  media: Media[];
  secs: Section[];
  related: string[];
};

const isPlaceholder = (v: unknown) => typeof v === 'string' && v.trim().startsWith('[');

let cached: Item[] | null = null;

export async function getItems(): Promise<Item[]> {
  if (cached) return cached;
  const entries = await getCollection('items');
  const warnings: string[] = [];
  const clean = (id: string, field: string, v: string | null | undefined) => {
    const s = (v ?? '').trim();
    if (isPlaceholder(s)) { warnings.push(`${id} ${field}: ${s}`); return ''; }
    return s;
  };

  const items: Item[] = entries.map((e) => {
    const d = e.data;
    const tags: Tag[] = [...d.topics, ...d.methods, ...d.tools, ...d.strengths].map((name) => ({ name, cat: THEME_BY_NAME.get(name)!.cat }));
    const secs: Section[] = [];
    const body = e.body ?? '';
    const hits = [...body.matchAll(/^##\s+(.+)$/gm)];
    hits.forEach((h, i) => {
      const start = h.index! + h[0].length;
      const end = i + 1 < hits.length ? hits[i + 1].index! : body.length;
      const text = body.slice(start, end).trim();
      const k = h[1].trim();
      if (!text) return;
      if (isPlaceholder(text)) { warnings.push(`${d.id} section "${k}": ${text.split(/\r?\n/)[0]}`); return; }
      secs.push({ k, paras: text.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s*\r?\n\s*/g, ' ').trim()).filter(Boolean) });
    });
    const metrics = d.metrics.filter((m) => {
      if (isPlaceholder(m)) { warnings.push(`${d.id} metric: ${m}`); return false; }
      return true;
    });
    return {
      id: d.id,
      order: d.order,
      tier: d.tier,
      featured: d.tier === 'Featured',
      title: d.title,
      short: d.short_label,
      slug: d.slug,
      setting: d.setting,
      group: d.group,
      sub: d.subgroup,
      type: d.type,
      org: clean(d.id, 'organization', d.organization),
      role: clean(d.id, 'role', d.role),
      dates: clean(d.id, 'dates', d.dates),
      summary: clean(d.id, 'summary', d.summary),
      tags,
      metrics,
      media: d.media,
      secs,
      related: [],
    };
  });

  items.sort((a, b) => a.order - b.order);
  const slugs = new Set<string>();
  for (const it of items) {
    if (slugs.has(it.slug)) throw new Error(`Duplicate item slug: ${it.slug}`);
    slugs.add(it.slug);
  }
  const counts = themeCounts(items);
  for (const it of items) it.related = related(it, items, 3, counts).map((r) => r.id);

  if (warnings.length) {
    console.warn(`\n[content] ${warnings.length} placeholder(s) hidden until filled in:\n  - ` + warnings.join('\n  - ') + '\n');
  }
  cached = items;
  return items;
}

export function getCloud(): Record<string, { x: number; y: number; fs: number; label?: string }> {
  const snap = JSON.parse(fs.readFileSync(path.resolve('data/site.json'), 'utf8'));
  return snap.cloud;
}

export const metaLine = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ');
