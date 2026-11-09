(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ingresso del titolo ---------- */
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1200))])
    .then(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* orbite del hero: ferme se l'utente preferisce meno movimento */
  if (reduce) $$('.hero-art svg').forEach(s => s.pauseAnimations && s.pauseAnimations());

  /* ---------- Navigazione ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#links');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    links.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

  /* voce di menu attiva in base alla sezione visibile */
  const navLinks = $$('.links a:not(.links-cta)');
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Comparsa allo scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .1, rootMargin: '0px 0px -4% 0px' });
  const seen = new Map();
  $$('.reveal').forEach(el => {
    const i = seen.get(el.parentElement) || 0;
    seen.set(el.parentElement, i + 1);
    el.style.setProperty('--d', Math.min(i, 5) * .09 + 's');
    io.observe(el);
  });

  /* ---------- Modulo contatti ---------- */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.field').classList.toggle('err', bad);
      if (bad) ok = false;
    });
    note.className = 'form-note';
    if (!ok) { note.textContent = 'Controlla i campi evidenziati.'; note.classList.add('bad'); return; }
    note.textContent = 'Invio in corso…';
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      note.textContent = 'Grazie! Abbiamo ricevuto la tua richiesta e ti risponderemo entro 24 ore.';
    } catch {
      note.textContent = 'Invio non riuscito. Scrivici a ciao@orbyt.studio.';
      note.classList.add('bad');
    }
  });

  $('#year').textContent = new Date().getFullYear();
})();
