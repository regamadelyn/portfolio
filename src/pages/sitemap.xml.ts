import type { APIRoute } from 'astro';
import { getItems } from '../lib/items';
import { url } from '../lib/url';

export const GET: APIRoute = async ({ site }) => {
  const items = await getItems();
  const paths = ['/', '/experience/', '/about/', ...items.map((i) => `/work/${i.slug}/`)];
  const locs = paths.map((p) => `  <url><loc>${new URL(url(p), site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
