// About page: flipping postcards and the contact form.
// For now the form builds a mailto: link. Swap in Formspree or Netlify Forms here once one is chosen.

export function initAbout() {
  document.querySelectorAll<HTMLButtonElement>('[data-postcard]').forEach((b) => {
    b.addEventListener('click', () => {
      const flipped = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      b.classList.toggle('flipped', flipped);
      b.setAttribute(
        'aria-label',
        flipped
          ? `Postcard back: ${b.dataset.cap || ''}, postmarked ${b.dataset.date || ''}. Select to see the photo.`
          : `${b.dataset.alt || ''}. Select to flip the postcard.`,
      );
    });
  });

  const form = document.querySelector<HTMLFormElement>('[data-contact]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const msg = String(fd.get('message') || '').trim();
    const body = `${msg}\n\n${name}${email ? ` (${email})` : ''}`;
    const to = form.dataset.email || '';
    location.href = `mailto:${to}?subject=${encodeURIComponent(`Portfolio message from ${name || 'a visitor'}`)}&body=${encodeURIComponent(body)}`;
  });
}
