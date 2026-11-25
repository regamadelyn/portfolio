// Theme-map layout, ported as-is from design/reference-logic.js (ring, layout).
// Pure functions: used at build time for the default cloud and in the browser for every change.

export type MapTheme = { name: string; cat: string };
export type MapNode = { id: string; order: number; featured: boolean; tags: string[] };
export type CloudPos = { x: number; y: number; fs: number; label?: string };
export type MapData = { themes: MapTheme[]; nodes: MapNode[]; cloud: Record<string, CloudPos> };
export type Pos = { x: number; y: number; fs: number; o: number; s: number; on: boolean; center?: boolean; conn?: boolean };
export type Filter = 'all' | 'topic' | 'method' | 'tools' | 'strengths' | 'feat';

const CAT_CLS: Record<string, Filter> = { Topic: 'topic', Method: 'method', 'Tools & skills': 'tools', Strengths: 'strengths' };

export function ring(count: number, rx: number, ry: number, offset: number) {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + offset + (i / count) * Math.PI * 2;
    out.push({ x: Math.min(91, Math.max(9, 50 + rx * Math.cos(a))), y: Math.min(95, Math.max(5, 50 + ry * Math.sin(a))) });
  }
  return out;
}

export function layout(data: MapData, focus: string | null, filt: Filter): Record<string, Pos> {
  const { themes, nodes, cloud } = data;
  const THEME: Record<string, MapTheme> = {};
  themes.forEach((t) => (THEME[t.name] = t));
  const showCat = (cat: string) => filt === 'all' || filt === CAT_CLS[cat];
  const showFeat = filt === 'all' || filt === 'feat';
  const pos: Record<string, Pos> = {};
  if (!focus) {
    themes.forEach((t) => {
      const c = cloud[t.name];
      const v = showCat(t.cat);
      pos['t:' + t.name] = { x: c.x, y: c.y, fs: c.fs, o: v ? 1 : 0, s: v ? 1 : 0.6, on: v };
    });
    nodes.forEach((n) => {
      const c = cloud[n.id];
      pos['n:' + n.id] = c && showFeat
        ? { x: c.x, y: c.y, fs: c.fs, o: 1, s: 1, on: true }
        : c ? { x: c.x, y: c.y, fs: c.fs, o: 0, s: 0.6, on: false }
        : { x: 50, y: 50, fs: 12, o: 0, s: 0.4, on: false };
    });
    return pos;
  }
  const byOrder = nodes.slice().sort((a, b) => a.order - b.order);
  const conn = byOrder.filter((n) => n.tags.includes(focus) && (filt !== 'feat' || n.featured));
  const inner = conn.slice(0, 8), outer = conn.slice(8);
  const pin = ring(inner.length, 20, 24, 0);
  const pout = ring(outer.length, 33, 37, outer.length ? Math.PI / outer.length : 0);
  const co: Record<string, number> = {};
  conn.forEach((n) => n.tags.forEach((t) => { if (t !== focus) co[t] = (co[t] || 0) + 1; }));
  const near = filt === 'feat' ? [] : Object.keys(co).filter((k) => THEME[k] && showCat(THEME[k].cat)).sort((a, b) => co[b] - co[a]).slice(0, 12);
  const pth = ring(near.length, 45, 44, Math.PI / 24);
  themes.forEach((t) => {
    const c = cloud[t.name];
    if (t.name === focus) pos['t:' + t.name] = { x: 50, y: 50, fs: 26, o: 1, s: 1, on: true, center: true };
    else {
      const i = near.indexOf(t.name);
      pos['t:' + t.name] = i >= 0 ? { x: pth[i].x, y: pth[i].y, fs: 15, o: 1, s: 1, on: true } : { x: c.x, y: c.y, fs: c.fs, o: 0, s: 0.6, on: false };
    }
  });
  nodes.forEach((n) => {
    const ii = inner.indexOf(n), oi = outer.indexOf(n);
    if (ii >= 0) pos['n:' + n.id] = { x: pin[ii].x, y: pin[ii].y, fs: 14, o: 1, s: 1, on: true, conn: true };
    else if (oi >= 0) pos['n:' + n.id] = { x: pout[oi].x, y: pout[oi].y, fs: 13, o: 1, s: 1, on: true, conn: true };
    else pos['n:' + n.id] = { x: 50, y: 50, fs: 12, o: 0, s: 0.4, on: false };
  });
  return pos;
}
