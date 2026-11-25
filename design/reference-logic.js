// Logic from the Claude Design reference (DCLogic = a small React-like base class).
// Port the pure functions (related, ring, layout) as-is; rewrite the Component for your framework.

const SITE = /* see data/site.json */ {};

const POSTCARDS = [
  { src: '/_blob/e9fca638a80018a2aeaa2c3e48508972', pos: '50% 72%', alt: 'Madelyn sitting on a bench at a mountain overlook at sunrise, with her black dog Tony Montana in front of her', cap: 'Sunrise hike with Tony Montana', date: 'Jul 2026' },
  { src: '/_blob/c6ac4ead328525c73a45e4e5d0b11d82', pos: '50% 60%', alt: 'Tony Montana, a black dog, peeking out of tall green grass under a blue sky', cap: 'Tony, mid-hike', date: 'Jul 2026' },
  { src: '/_blob/f52bbe89e274346f66f28623fa36cd58', pos: '50% 40%', alt: 'Madelyn in a red bandana taking a selfie above a canyon in Zion National Park', cap: 'Zion National Park', date: 'May 2026' }
];
const CAT_CLS = { 'Topic': 'topic', 'Method': 'method', 'Tools & skills': 'tools', 'Strengths': 'strengths' };
const CAT_LABEL = { 'Topic': 'Topics', 'Method': 'Methods', 'Tools & skills': 'Tools & skills', 'Strengths': 'Strengths' };
const NODE = {}; SITE.nodes.forEach((n) => { NODE[n.id] = n; });
const THEME = {}; SITE.themes.forEach((t) => { THEME[t.name] = t; });
const COUNT = {}; SITE.nodes.forEach((n) => n.tags.forEach((t) => { COUNT[t.name] = (COUNT[t.name] || 0) + 1; }));
const hasTag = (n, name) => n.tags.some((t) => t.name === name);
const BY_RANK = SITE.nodes.slice().sort((a, b) => a.rank - b.rank);

// recommender: shared themes, rarer themes weigh more
function related(n, k) {
  const mine = new Set(n.tags.map((t) => t.name));
  return SITE.nodes.filter((m) => m.id !== n.id).map((m) => {
    let s = 0; m.tags.forEach((t) => { if (mine.has(t.name)) s += 1 / Math.log2(1 + COUNT[t.name]); });
    return { m, s: s - m.rank * 0.002 };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.m);
}

function ring(count, rx, ry, offset) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + offset + (i / count) * Math.PI * 2;
    out.push({ x: Math.min(91, Math.max(9, 50 + rx * Math.cos(a))), y: Math.min(95, Math.max(5, 50 + ry * Math.sin(a))) });
  }
  return out;
}

function layout(focus, filt) {
  const showCat = (cat) => filt === 'all' || filt === CAT_CLS[cat];
  const showFeat = filt === 'all' || filt === 'feat';
  const pos = {};
  if (!focus) {
    SITE.themes.forEach((t) => { const c = SITE.cloud[t.name]; const v = showCat(t.cat); pos['t:' + t.name] = { x: c.x, y: c.y, fs: c.fs, o: v ? 1 : 0, s: v ? 1 : 0.6, on: v }; });
    SITE.nodes.forEach((n) => {
      const c = SITE.cloud[n.id];
      pos['n:' + n.id] = c && showFeat ? { x: c.x, y: c.y, fs: c.fs, o: 1, s: 1, on: true } : c ? { x: c.x, y: c.y, fs: c.fs, o: 0, s: 0.6, on: false } : { x: 50, y: 50, fs: 12, o: 0, s: 0.4, on: false };
    });
    return pos;
  }
  const conn = BY_RANK.filter((n) => hasTag(n, focus) && (filt !== 'feat' || n.featured));
  const inner = conn.slice(0, 8), outer = conn.slice(8);
  const pin = ring(inner.length, 20, 24, 0);
  const pout = ring(outer.length, 33, 37, outer.length ? Math.PI / outer.length : 0);
  const co = {};
  conn.forEach((n) => n.tags.forEach((t) => { if (t.name !== focus) co[t.name] = (co[t.name] || 0) + 1; }));
  const near = filt === 'feat' ? [] : Object.keys(co).filter((k) => THEME[k] && showCat(THEME[k].cat)).sort((a, b) => co[b] - co[a]).slice(0, 12);
  const pth = ring(near.length, 45, 44, Math.PI / 24);
  SITE.themes.forEach((t) => {
    const c = SITE.cloud[t.name];
    if (t.name === focus) pos['t:' + t.name] = { x: 50, y: 50, fs: 26, o: 1, s: 1, on: true, center: true };
    else {
      const i = near.indexOf(t.name);
      pos['t:' + t.name] = i >= 0 ? { x: pth[i].x, y: pth[i].y, fs: 15, o: 1, s: 1, on: true } : { x: c.x, y: c.y, fs: c.fs, o: 0, s: 0.6, on: false };
    }
  });
  SITE.nodes.forEach((n) => {
    const ii = inner.indexOf(n), oi = outer.indexOf(n);
    if (ii >= 0) pos['n:' + n.id] = { x: pin[ii].x, y: pin[ii].y, fs: 14, o: 1, s: 1, on: true, conn: true };
    else if (oi >= 0) pos['n:' + n.id] = { x: pout[oi].x, y: pout[oi].y, fs: 13, o: 1, s: 1, on: true, conn: true };
    else pos['n:' + n.id] = { x: 50, y: 50, fs: 12, o: 0, s: 0.4, on: false };
  });
  return pos;
}

const tagChip = (t, go, kind) => ({ name: t.name, cls: (kind || 'chip') + ' cat-' + CAT_CLS[t.cat], go });
const cardMeta = (n) => [n.type, n.dates].filter(Boolean).join(' · ');

class Component extends DCLogic {
  state = { view: 'home', itemId: null, trail: [], open: null, focus: null, filt: 'all', slide: 0, active: 'home', flips: {} };

  componentDidMount() {
    this.onScroll = () => {
      if (this.state.view !== 'home') return;
      const g = document.getElementById('gallery');
      if (!g) return;
      const next = g.getBoundingClientRect().top < window.innerHeight * 0.4 ? 'gallery' : 'home';
      if (next !== this.state.active) this.setState({ active: next });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  componentWillUnmount() {
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.scrollTarget) {
      const id = this.scrollTarget; this.scrollTarget = null;
      requestAnimationFrame(() => {
        const el = id === 'top' ? null : document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }
    if (this.state.focus !== prevState.focus && this.linesEl) {
      this.linesEl.classList.remove('draw'); void this.linesEl.getBoundingClientRect(); if (this.state.focus) this.linesEl.classList.add('draw');
    }
    if (this.state.open && !prevState.open && this.closeEl) this.closeEl.focus();
  }

  _go(patch, target) { this.scrollTarget = target || 'top'; this.setState({ open: null, ...patch }); }
  _here() { return { view: this.state.view, itemId: this.state.itemId }; }
  _openItem(id) { this._go({ view: 'item', itemId: id, slide: 0, trail: [...this.state.trail, this._here()].slice(-20), active: '' }); }
  _focusTheme(name) { this._go({ view: 'home', focus: name, active: 'gallery', trail: [] }, 'gallery'); }

  renderVals() {
    const accent = this.props.accent ?? '#D7FF3F';
    const dim = this.props.dimOthers ?? true;
    const st = this.state;

    const navDefs = [
      { id: 'home', label: 'Home', icon: '/_blob/c053f350fb560241271ddd8e73820777', iconOn: '/_blob/565e95313a25043cf8b311dcb296d1f8', go: () => this._go({ view: 'home', active: 'home', trail: [] }, 'top') },
      { id: 'gallery', label: 'Gallery', icon: '/_blob/853d68d0f504aaa42cbece17d19b0b17', iconOn: '/_blob/243bb4ccaed6166c9ee09a8f61265cda', go: () => this._go({ view: 'home', active: 'gallery', trail: [] }, 'gallery') },
      { id: 'experience', label: 'Experience', icon: '/_blob/06d56a12820cd349709e4d5d73bfabcf', iconOn: '/_blob/d1afab27cf8d8cfaad63ce30e851d1b1', go: () => this._go({ view: 'experience', active: 'experience', trail: [] }, 'top') },
      { id: 'contact', label: 'Contact', icon: '/_blob/0345f076feccba9056e6f154c25b6db3', iconOn: '/_blob/7a9813b3bb3e2ec58986be799d06cabf', go: () => this._go({ view: 'about', active: 'contact', trail: [] }, 'contact') },
      { id: 'about', label: 'About', icon: '/_blob/3a0d98db0666dc81f810fcdcd25fb7ab', iconOn: '/_blob/1a9cedc94fad486c32d2efc2304fb148', go: () => this._go({ view: 'about', active: 'about', trail: [] }, 'about-me') }
    ];
    const nav = navDefs.map((n) => ({ ...n, icon: st.active === n.id ? n.iconOn : n.icon, cls: 'dock-item' + (st.active === n.id ? ' is-active' : ''), current: st.active === n.id ? 'page' : 'false' }));

    // theme map
    const focus = st.focus && THEME[st.focus] ? st.focus : null;
    const filt = st.filt || 'all';
    const pos = layout(focus, filt);
    const FILTERS = [{ id: 'all', label: 'All' }, { id: 'topic', label: 'Topics', color: 'var(--accent)' }, { id: 'method', label: 'Methods', color: 'linear-gradient(115deg,#ffd9ec,#fff1cf,#d6fbef)' }, { id: 'tools', label: 'Tools & skills', color: '#ffffff' }, { id: 'strengths', label: 'Strengths', color: '#aab1bf' }, { id: 'feat', label: 'Featured work', color: 'var(--accent)' }];
    const filters = FILTERS.map((f) => ({ label: f.label, dot: !!f.color, color: f.color || '', on: filt === f.id ? 'true' : 'false', cls: 'flt' + (filt === f.id ? ' on' : ''), go: () => this.setState({ filt: f.id }) }));
    const mapItems = [];
    SITE.themes.forEach((t, i) => {
      const p = pos['t:' + t.name];
      mapItems.push({ key: 't' + i, label: t.name, x: p.x.toFixed(2), y: p.y.toFixed(2), fs: p.fs, o: p.o, s: p.s, d: p.on ? (i % 9) * 25 : 0,
        cls: 'mi t cat-' + CAT_CLS[t.cat] + (p.center ? ' center chrome-pill' : '') + (p.on ? '' : ' off'), pin: false,
        tab: p.on ? '0' : '-1', hidden: p.on ? 'false' : 'true',
        aria: p.center ? t.name + ', selected theme. Select to show everything' : t.name + ', ' + t.cat + ', ' + COUNT[t.name] + ' connected',
        click: p.center ? () => this.setState({ focus: null }) : () => this.setState({ focus: t.name }) });
    });
    const lines = [];
    SITE.nodes.forEach((n, i) => {
      const p = pos['n:' + n.id];
      if (p.conn) lines.push('M50 50L' + p.x.toFixed(2) + ' ' + p.y.toFixed(2));
      mapItems.push({ key: n.id, label: focus ? n.short : (SITE.cloud[n.id] ? SITE.cloud[n.id].label : n.short), x: p.x.toFixed(2), y: p.y.toFixed(2), fs: p.fs, o: p.o, s: p.s, d: p.on ? 120 + (i % 12) * 22 : 0,
        cls: 'mi n' + (n.featured ? ' feat' : '') + (p.on ? '' : ' off'), pin: n.featured,
        tab: p.on ? '0' : '-1', hidden: p.on ? 'false' : 'true',
        aria: n.title + ', ' + n.setting + ' ' + n.type + '. Opens a preview',
        click: () => this.setState({ open: n.id }) });
    });
    const ft = focus ? THEME[focus] : null;
    const focusLabel = ft ? CAT_LABEL[ft.cat] + ' · ' + COUNT[focus] + ' connected' : '';
    const focusTitle = ft ? ft.name : '';
    const focusDesc = ft ? ft.desc : '';

    // preview (camera)
    let pv = { crumb: '', title: '', meta: '', summary: '', hasMedia: false, noMedia: true, img: '', fit: 'cover', tags: [], related: [], open: () => {} };
    const on = st.open && NODE[st.open] ? NODE[st.open] : null;
    if (on) {
      const m = on.media[0];
      pv = { crumb: on.setting + ' · ' + on.type, title: on.title, meta: [on.org, on.dates].filter(Boolean).join(' · '), summary: on.summary,
        hasMedia: !!m, noMedia: !m, img: m ? m.src : '', fit: m ? (m.fit === 'cover' ? 'cover' : 'contain') : 'cover',
        tags: on.tags.map((t) => tagChip(t, () => this._focusTheme(t.name))),
        related: related(on, 3).map((r) => ({ title: r.title, setting: r.setting, go: () => this._openItem(r.id) })),
        open: () => this._openItem(on.id) };
    }
    const close = () => this.setState({ open: null });

    // item page
    let item = { crumb: '', featured: false, title: '', meta: '', summary: '', metrics: [], hasMetrics: false, hasMedia: false, isCarousel: false, topCls: 'top-row solo', secs: [], tagRows: [], related: [] };
    let slide = { src: '', cap: '', fit: 'contain' }, dots = [];
    const it = st.view === 'item' && NODE[st.itemId] ? NODE[st.itemId] : null;
    if (it) {
      const nm = it.media.length, si = nm ? ((st.slide % nm) + nm) % nm : 0;
      if (nm) slide = it.media[si];
      dots = it.media.map((m, i) => ({ cls: 'dot' + (i === si ? ' on' : ''), on: i === si ? 'true' : 'false', aria: 'Image ' + (i + 1) + ' of ' + nm, go: () => this.setState({ slide: i }) }));
      const rows = ['Topic', 'Method', 'Tools & skills', 'Strengths'].map((c) => ({ label: CAT_LABEL[c], tags: it.tags.filter((t) => t.cat === c).map((t) => tagChip(t, () => this._focusTheme(t.name))) })).filter((r) => r.tags.length);
      item = { crumb: it.setting + ' · ' + it.type, featured: it.featured, title: it.title, meta: [it.org, it.role, it.dates].filter(Boolean).join(' · '), summary: it.summary,
        metrics: it.metrics, hasMetrics: it.metrics.length > 0, hasMedia: nm > 0, isCarousel: nm > 1, topCls: nm ? 'top-row' : 'top-row solo',
        secs: it.secs, tagRows: rows,
        related: related(it, 3).map((r) => ({ title: r.title, summary: r.summary, meta: r.setting + ' · ' + r.type, tags: r.tags.slice(0, 3).map((t) => tagChip(t, null, 'tag')), go: () => this._openItem(r.id) })) };
    }
    const prev = st.trail[st.trail.length - 1];
    const backLabel = !prev ? 'Gallery' : prev.view === 'experience' ? 'Experience' : prev.view === 'item' ? 'Back' : prev.view === 'about' ? 'About' : 'Gallery';
    const goBack = () => {
      if (!prev || prev.view === 'home') { this._go({ view: 'home', active: 'gallery', trail: [] }, 'gallery'); return; }
      this._go({ view: prev.view, itemId: prev.itemId, slide: 0, active: prev.view === 'item' ? '' : prev.view, trail: st.trail.slice(0, -1) });
    };

    // experience
    const GROUPS = [
      { name: 'Work', id: 'exp-work', blurb: 'Roles and product case studies', subs: ['Roles', 'Product, design & research case studies'] },
      { name: 'School', id: 'exp-school', blurb: 'Research, degrees and coursework', subs: ['Research & projects', 'Degrees & credentials', 'Coursework'] },
      { name: 'Volunteer', id: 'exp-volunteer', blurb: 'Service and advocacy', subs: ['Service & advocacy'] }
    ];
    const groups = GROUPS.map((g) => {
      const subs = g.subs.map((s) => ({ name: s, items: BY_RANK.filter((n) => n.group === g.name && n.sub === s).map((n) => ({
        title: n.title, summary: n.summary, meta: cardMeta(n), tags: n.tags.slice(0, 3).map((t) => tagChip(t, null, 'tag')), go: () => this._openItem(n.id) })) })).filter((s) => s.items.length);
      return { ...g, href: '#' + g.id, count: subs.reduce((a, s) => a + s.items.length, 0), subs };
    });

    return {
      accent, nav,
      isHome: st.view === 'home', isItem: !!it, isExperience: st.view === 'experience', isAbout: st.view === 'about',
      goHome: navDefs[0].go, goGallery: navDefs[1].go, toTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      mapCls: 'map' + (focus ? ' focused' : '') + (dim ? ' dim' : ''), mapItems, linePath: lines.join(' ') || 'M50 50',
      linesRef: (el) => { this.linesEl = el; },
      isFocused: !!focus, hasFocusLabel: !!focusLabel, filters, focusLabel, focusTitle, focusDesc, resetMap: () => this.setState({ focus: null }),
      modalOpen: !!on, pv, close, closeRef: (el) => { this.closeEl = el; },
      onDialogKey: (e) => { if (e.key === 'Escape') close(); },
      item, slide, dots, backLabel, goBack,
      prevSlide: () => this.setState({ slide: st.slide - 1 }), nextSlide: () => this.setState({ slide: st.slide + 1 }),
      groups,
      postcards: POSTCARDS.map((p, i) => { const f = !!(st.flips || {})[i]; return { ...p, cls: 'postcard' + (f ? ' flipped' : ''), pressed: f ? 'true' : 'false', aria: p.cap + '. ' + (f ? 'Showing the back. Select to see the photo.' : 'Select to flip the postcard.'), flip: () => this.setState({ flips: { ...(st.flips || {}), [i]: !f } }) }; }),
      nameRef: (el) => { this.nameEl = el; }, emailRef: (el) => { this.emailEl = el; }, msgRef: (el) => { this.msgEl = el; },
      sendMessage: (e) => {
        e.preventDefault();
        const n = this.nameEl ? this.nameEl.value.trim() : '', em = this.emailEl ? this.emailEl.value.trim() : '', m = this.msgEl ? this.msgEl.value.trim() : '';
        const body = m + '\n\n' + n + (em ? ' (' + em + ')' : '');
        window.location.href = 'mailto:madelynrega@gmail.com?subject=' + encodeURIComponent('Portfolio message from ' + (n || 'a visitor')) + '&body=' + encodeURIComponent(body);
      }
    };
  }
}
