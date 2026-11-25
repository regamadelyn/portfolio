// Item page: "Back" goes to the previous page in history, or to /#gallery if there is none;
// the media carousel (prev/next, dots with aria-pressed, per-slide caption).

export function initItemPage() {
  const back = document.querySelector<HTMLAnchorElement>('[data-back]');
  back?.addEventListener('click', (e) => {
    let sameSite = false;
    try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch { /* no referrer */ }
    if (sameSite && history.length > 1) { e.preventDefault(); history.back(); }
  });

  const fig = document.querySelector<HTMLElement>('[data-carousel]');
  if (!fig) return;
  const slides = [...fig.querySelectorAll<HTMLImageElement>('[data-slide]')];
  const dots = [...fig.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const cap = fig.querySelector<HTMLElement>('[data-caption]')!;
  if (slides.length < 2) return;
  let cur = 0;
  const show = (i: number) => {
    cur = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((s, j) => (s.hidden = j !== cur));
    dots.forEach((d, j) => { d.classList.toggle('on', j === cur); d.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
    cap.textContent = slides[cur].dataset.cap || '';
  };
  fig.querySelector('[data-prev]')?.addEventListener('click', () => show(cur - 1));
  fig.querySelector('[data-next]')?.addEventListener('click', () => show(cur + 1));
  dots.forEach((d) => d.addEventListener('click', () => show(Number(d.dataset.dot))));
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
}
