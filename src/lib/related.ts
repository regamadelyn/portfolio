// "Related work" recommender. Kept in its own module so it can be swapped for a better algorithm.
// Score = sum over shared themes of 1 / log2(1 + count(theme)), so rarer themes weigh more,
// minus order × 0.002 as a tiebreak. Scores ≤ 0 are dropped; the top k are returned.

export type Recommendable = { id: string; order: number; tags: { name: string }[] };

export function themeCounts(items: Recommendable[]) {
  const count: Record<string, number> = {};
  items.forEach((n) => n.tags.forEach((t) => (count[t.name] = (count[t.name] || 0) + 1)));
  return count;
}

export function related<T extends Recommendable>(n: T, items: T[], k = 3, count = themeCounts(items)): T[] {
  const mine = new Set(n.tags.map((t) => t.name));
  return items
    .filter((m) => m.id !== n.id)
    .map((m) => {
      let s = 0;
      m.tags.forEach((t) => { if (mine.has(t.name)) s += 1 / Math.log2(1 + count[t.name]); });
      return { m, s: s - m.order * 0.002 };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.m);
}
