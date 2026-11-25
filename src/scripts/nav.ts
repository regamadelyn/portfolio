// Nav dock active state. On "/", Home vs Gallery follows scroll (gallery is active once its top
// passes 40% of the viewport). On /about, Contact vs About follows the same rule for #about-me.
// Other pages set the active item at build time.

function setActive(id: string) {
  document.querySelectorAll<HTMLAnchorElement>('.dock-item').forEach((a) => {
    const on = a.dataset.nav === id;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
    const img = a.querySelector('img');
    const src = on ? a.dataset.iconOn : a.dataset.iconOff;
    if (img && src && img.getAttribute('src') !== src) img.setAttribute('src', src);
  });
}

function watch(targetId: string, before: string, after: string) {
  const el = document.getElementById(targetId);
  if (!el) return;
  let current = '';
  const check = () => {
    const next = el.getBoundingClientRect().top < window.innerHeight * 0.4 ? after : before;
    if (next !== current) { current = next; setActive(next); }
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
}

export function initNav() {
  const dock = document.querySelector<HTMLElement>('.dock');
  const active = dock?.dataset.active;
  if (active === 'home' || active === 'gallery') watch('gallery', 'home', 'gallery');
  if (active === 'contact' || active === 'about') watch('about-me', 'contact', 'about');

  document.querySelectorAll<HTMLAnchorElement>('[data-to-top]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      document.querySelector<HTMLElement>('.mark')?.focus({ preventScroll: true });
    }),
  );
}
