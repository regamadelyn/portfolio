// SITE_URL and BASE_PATH default to GitHub Pages (https://regamadelyn.github.io/portfolio).
// For a custom domain, set SITE_URL=https://example.com and BASE_PATH=/ (or change the defaults).
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://regamadelyn.github.io',
  base: process.env.BASE_PATH ?? '/portfolio',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
