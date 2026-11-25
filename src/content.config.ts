// Item frontmatter schema. The build fails on an unknown theme, category or subgroup,
// a missing required field, or a media file that doesn't exist.
import fs from 'node:fs';
import path from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { THEMES, type Cat } from './lib/themes';

const themeList = (cat: Cat) => {
  const allowed = new Set(THEMES.filter((t) => t.cat === cat).map((t) => t.name));
  return z.array(z.string()).default([]).superRefine((arr, ctx) => {
    for (const name of arr) {
      if (!allowed.has(name)) ctx.addIssue({ code: 'custom', message: `Unknown ${cat} theme "${name}" (check content/themes.md)` });
    }
  });
};

const media = z
  .object({ src: z.string(), caption: z.string().min(1), fit: z.enum(['cover', 'contain']).default('contain') })
  .superRefine((m, ctx) => {
    if (!fs.existsSync(path.resolve('public' + m.src))) ctx.addIssue({ code: 'custom', message: `Media file not found: public${m.src}` });
  });

const SUBGROUPS = {
  Work: ['Roles', 'Product, design & research case studies'],
  School: ['Research & projects', 'Degrees & credentials', 'Coursework'],
  Volunteer: ['Service & advocacy'],
} as const;

const items = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/items' }),
  schema: z
    .object({
      id: z.string().min(1),
      order: z.number().int(),
      tier: z.enum(['Featured', 'Core', 'Supporting']),
      title: z.string().min(1),
      short_label: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      setting: z.enum(['Work', 'School', 'Volunteer']),
      group: z.enum(['Work', 'School', 'Volunteer']),
      subgroup: z.string().min(1),
      type: z.string().min(1),
      organization: z.string().nullish(),
      role: z.string().nullish(),
      dates: z.string().nullish(),
      summary: z.string().min(1),
      topics: themeList('Topic'),
      methods: themeList('Method'),
      tools: themeList('Tools & skills'),
      strengths: themeList('Strengths'),
      metrics: z.array(z.string()).default([]),
      media: z.array(media).default([]),
      internal_notes: z.string().nullish(),
    })
    .superRefine((d, ctx) => {
      if (!(SUBGROUPS[d.group] as readonly string[]).includes(d.subgroup)) {
        ctx.addIssue({ code: 'custom', message: `Unknown subgroup "${d.subgroup}" for group ${d.group}` });
      }
    }),
});

export const collections = { items };
