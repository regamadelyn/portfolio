// Gallery of Work: theme map state (focus + filter), deep links (?theme=slug) and the camera preview modal.
import { layout, type Filter, type MapData } from '../lib/layout';

type ThemeInfo = { name: string; cat: string; cls: string; label: string; desc: string; slug: string; count: number };
type ItemInfo = {
  id: string; title: string; short: string; cloudLabel: string; crumb: string; meta: string; summary: string;
  href: string; img: string; fit: string; tags: { name: string; cls: string }[];
  related: { title: string; setting: string; href: string }[];
};
type Data = { base: string; map: MapData; themes: ThemeInfo[]; items: ItemInfo[] };

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function initGallery() {
  const dataEl = document.getElementById('gallery-data');
  const mapEl = document.querySelector<HTMLElement>('[data-map]');
  if (!dataEl || !mapEl) return;
  const data: Data = JSON.parse(dataEl.textContent || '{}');
  const THEME = new Map(data.themes.map((t) => [t.name, t]));
  const BY_SLUG = new Map(data.themes.map((t) => [t.slug, t]));
  const ITEM = new Map(data.items.map((n) => [n.id, n]));

  const themeBtns = [...mapEl.querySelectorAll<HTMLButtonElement>('[data-theme]')];
  const itemBtns = [...mapEl.querySelectorAll<HTMLButtonElement>('[data-item]')];
  const lines = mapEl.querySelector<SVGSVGElement>('.lines')!;
  const path = lines.querySelector('path')!;
  const filterBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const fLabel = document.querySelector<HTMLElement>('[data-focus-label]')!;
  const fTitle = document.querySelector<HTMLElement>('[data-focus-title]')!;
  const fDesc = document.querySelector<HTMLElement>('[data-focus-desc]')!;
  const resetBtn = document.querySelector<HTMLButtonElement>('[data-reset]')!;

  let focus: string | null = null;
  let filt: Filter = 'all';

  function setVars(el: HTMLElement, p: { x: number; y: number; fs: number; o: number; s: number }, d: number) {
    el.style.setProperty('--x', p.x.toFixed(2) + '%');
    el.style.setProperty('--y', p.y.toFixed(2) + '%');
    el.style.setProperty('--fs', String(p.fs));
    el.style.setProperty('--o', String(p.o));
    el.style.setProperty('--s', String(p.s));
    el.style.setProperty('--d', d + 'ms');
  }
  function setOn(el: HTMLElement, on: boolean) {
    el.classList.toggle('off', !on);
    if (on) { el.removeAttribute('tabindex'); el.removeAttribute('aria-hidden'); }
    else { el.setAttribute('tabindex', '-1'); el.setAttribute('aria-hidden', 'true'); }
  }

  function syncUrl() {
    const u = new URL(location.href);
    if (focus) u.searchParams.set('theme', THEME.get(focus)!.slug);
    else u.searchParams.delete('theme');
    history.replaceState(history.state, '', u.pathname + u.search + u.hash);
  }

  function render() {
    const hadFocus = document.activeElement as HTMLElement | null;
    const pos = layout(data.map, focus, filt);
    mapEl!.classList.toggle('focused', !!focus);

    themeBtns.forEach((b) => {
      const t = THEME.get(b.dataset.theme!)!;
      const p = pos['t:' + t.name];
      const i = Number(b.dataset.i);
      setVars(b, p, p.on ? (i % 9) * 25 : 0);
      setOn(b, p.on);
      b.classList.toggle('center', !!p.center);
      b.classList.toggle('chrome-pill', !!p.center);
      b.setAttribute('aria-label', p.center ? `${t.name}, selected theme. Select to show everything` : `${t.name}, ${t.cat}, ${t.count} connected`);
    });
    const segs: string[] = [];
    itemBtns.forEach((b) => {
      const n = ITEM.get(b.dataset.item!)!;
      const p = pos['n:' + n.id];
      const i = Number(b.dataset.i);
      setVars(b, p, p.on ? 120 + (i % 12) * 22 : 0);
      setOn(b, p.on);
      b.querySelector('.lbl')!.textContent = focus ? n.short : n.cloudLabel;
      if (p.conn) segs.push(`M50 50L${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
    });
    path.setAttribute('d', segs.join(' ') || 'M50 50');
    lines.classList.remove('draw');
    void lines.getBoundingClientRect();
    if (focus) lines.classList.add('draw');

    const t = focus ? THEME.get(focus)! : null;
    fLabel.hidden = fTitle.hidden = fDesc.hidden = resetBtn.hidden = !t;
    fLabel.textContent = t ? `${t.label} · ${t.count} connected` : '';
    fTitle.textContent = t ? t.name : '';
    fDesc.textContent = t ? t.desc : '';

    filterBtns.forEach((b) => {
      const on = b.dataset.filter === filt;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    // Keep keyboard focus on something visible.
    if (hadFocus && hadFocus.classList.contains('off')) {
      const center = themeBtns.find((b) => b.classList.contains('center'));
      (center ?? filterBtns.find((b) => b.classList.contains('on')))?.focus({ preventScroll: true });
    }
    syncUrl();
  }

  function setFocus(name: string | null) {
    focus = name && THEME.has(name) ? name : null;
    render();
  }

  themeBtns.forEach((b) => b.addEventListener('click', () => {
    if (b.classList.contains('center')) setFocus(null);
    else setFocus(b.dataset.theme!);
  }));
  itemBtns.forEach((b) => b.addEventListener('click', () => openPreview(b.dataset.item!, b)));
  filterBtns.forEach((b) => b.addEventListener('click', () => { filt = b.dataset.filter as Filter; render(); }));
  resetBtn.addEventListener('click', () => {
    setFocus(null);
    themeBtns.find((b) => !b.classList.contains('off'))?.focus({ preventScroll: true });
  });

  // ---- camera preview modal ----
  const overlay = document.querySelector<HTMLElement>('[data-overlay]')!;
  const dialog = overlay.querySelector<HTMLElement>('[role="dialog"]')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.close-btn')!;
  const pv = (k: string) => overlay.querySelector<HTMLElement>(`[data-pv="${k}"]`)!;
  let opener: HTMLElement | null = null;

  function openPreview(id: string, from: HTMLElement) {
    const n = ITEM.get(id);
    if (!n) return;
    opener = from;
    pv('crumb').textContent = n.crumb;
    pv('title').textContent = n.title;
    pv('meta').textContent = n.meta;
    pv('meta').hidden = !n.meta;
    const img = pv('img') as HTMLImageElement;
    pv('thumb').hidden = !n.img;
    pv('summary').hidden = !!n.img;
    if (n.img) { img.src = n.img; img.style.objectFit = n.fit; pv('summary-thumb').textContent = n.summary; }
    else pv('summary').textContent = n.summary;
    (pv('open') as HTMLAnchorElement).href = n.href;

    const tags = pv('tags');
    tags.replaceChildren(...n.tags.map((t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `chip cat-${t.cls}`;
      b.textContent = t.name;
      b.addEventListener('click', () => {
        closePreview(false);
        document.getElementById('gallery')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        setFocus(t.name);
        themeBtns.find((x) => x.dataset.theme === t.name)?.focus({ preventScroll: true });
      });
      return b;
    }));
    const rel = pv('related');
    rel.replaceChildren(...n.related.map((r) => {
      const a = document.createElement('a');
      a.className = 'rel';
      a.href = r.href;
      const b = document.createElement('b');
      b.textContent = r.title;
      const s = document.createElement('span');
      s.className = 'mono';
      s.style.cssText = 'color:#5b6070;font-size:11px;white-space:nowrap';
      s.textContent = `${r.setting} →`;
      a.append(b, s);
      return a;
    }));

    overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    (overlay.querySelector('.screen') as HTMLElement).scrollTop = 0;
    closeBtn.focus();
  }

  function closePreview(restore = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.style.overflow = '';
    if (restore && opener && !opener.classList.contains('off')) opener.focus({ preventScroll: true });
    opener = null;
  }

  overlay.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closePreview()));
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closePreview(); return; }
    if (e.key !== 'Tab') return;
    const f = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[hidden]'));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ---- deep link: /?theme=<slug> ----
  const slug = new URLSearchParams(location.search).get('theme');
  const fromLink = slug ? BY_SLUG.get(slug) : undefined;
  if (fromLink) {
    focus = fromLink.name;
    render();
    requestAnimationFrame(() => document.getElementById('gallery')?.scrollIntoView({ block: 'start' }));
  }
}
