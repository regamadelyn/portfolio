// Prefixes a site path with the deploy base (e.g. "/portfolio" on GitHub Pages, "" on a custom domain).
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const url = (p = '/') => BASE + (p.startsWith('/') ? p : '/' + p);
export const base = BASE;
