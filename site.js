(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. DARK MODE
  ══════════════════════════════════════════ */
  const DARK_KEY = 'yk-theme';
  const html     = document.documentElement;
  const saved    = localStorage.getItem(DARK_KEY);
  if (saved === 'dark') html.setAttribute('data-theme', 'dark');

  function injectToggle () {
    if (document.getElementById('dm-toggle')) return;
    const nav = document.querySelector('.top-nav');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.id = 'dm-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML = currentIcon();
    btn.addEventListener('click', toggleTheme);
    const cv = nav.querySelector('.btn-cv');
    if (cv) cv.after(btn);
    else nav.appendChild(btn);
  }

  function currentIcon () {
    return html.getAttribute('data-theme') === 'dark'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="5"/>
           <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
           <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
           <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
           <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
           <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
           <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
         </svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
  }

  function toggleTheme () {
    const isDark = html.getAttribute('data-theme') === 'dark';
    isDark ? html.removeAttribute('data-theme') : html.setAttribute('data-theme', 'dark');
    localStorage.setItem(DARK_KEY, isDark ? 'light' : 'dark');
    const btn = document.getElementById('dm-toggle');
    if (btn) btn.innerHTML = currentIcon();
  }

  /* ══════════════════════════════════════════
     2. SPA NAVIGATION
  ══════════════════════════════════════════ */
  const pageCache = {};
  let   navigating = false;
  const SPA_PAGES  = new Set(['index.html', 'research.html', 'teaching.html', 'code.html']);

  /* Transition style */
  const transStyle = document.createElement('style');
  transStyle.id    = 'spa-trans';
  transStyle.textContent = `.main{transition:opacity .18s ease}.main.fading{opacity:0}`;
  document.head.appendChild(transStyle);

  function isSpaLink (url) {
    try {
      const u = new URL(url, location.href);
      if (u.hostname !== location.hostname) return false;
      if (u.search) return false;
      if (u.href.endsWith('.pdf')) return false;
      const filename = u.pathname.split('/').pop();
      return SPA_PAGES.has(filename) || filename === '' || u.pathname.endsWith('/');
    } catch { return false; }
  }

  async function navigateTo (url, pushState) {
    if (navigating) return;
    navigating = true;
    const main = document.querySelector('.main');
    main.classList.add('fading');
    await sleep(180);

    let doc;
    try {
      if (pageCache[url]) {
        doc = pageCache[url];
      } else {
        const text = await (await fetch(url)).text();
        doc = new DOMParser().parseFromString(text, 'text/html');
        pageCache[url] = doc;
      }
    } catch {
      location.href = url;
      return;
    }

    /* Swap content */
    const newContent = doc.querySelector('.content-inner');
    const oldContent = document.querySelector('.content-inner');
    if (newContent && oldContent) oldContent.innerHTML = newContent.innerHTML;

    /* Swap page-specific styles */
    document.querySelectorAll('style[data-spa-page]').forEach(s => s.remove());
    doc.querySelectorAll('head style').forEach(s => {
      const el = document.createElement('style');
      el.setAttribute('data-spa-page', '1');
      el.textContent = s.textContent;
      document.head.appendChild(el);
    });

    document.title = doc.title;
    updateActiveNav(url);
    if (pushState) history.pushState({ url }, '', url);
    window.scrollTo(0, 0);
    document.querySelector('.main')?.scrollTo(0, 0);

    /* Re-run inits */
    injectToggle();
    initResearchTouch();
    initTeachingTouch();

    main.classList.remove('fading');
    navigating = false;
  }

  function updateActiveNav (url) {
    document.querySelectorAll('.top-nav a').forEach(a => {
      a.classList.remove('active');
      try {
        const aPath = new URL(a.href, location.href).pathname;
        const uPath = new URL(url,   location.href).pathname;
        if (aPath === uPath) a.classList.add('active');
      } catch {}
    });
  }

  function interceptLinks () {
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || !a.href) return;
      if (a.target === '_blank') return;
      if (!isSpaLink(a.href)) return;
      e.preventDefault();
      if (a.href === location.href) return;
      navigateTo(a.href, true);
    });
  }

  window.addEventListener('popstate', e => {
    if (e.state?.url) navigateTo(e.state.url, false);
  });
  history.replaceState({ url: location.href }, '', location.href);

  /* Mark initial page styles so they get swapped on first navigation */
  document.querySelectorAll('head style:not([id])').forEach(s => {
    s.setAttribute('data-spa-page', '1');
  });

  function sleep (ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ══════════════════════════════════════════
     3. RESEARCH TOUCH (tap row → expand below)
  ══════════════════════════════════════════ */
  function initResearchTouch () {
    const rows = document.querySelectorAll('.res-row');
    if (!rows.length) return;

    if (!document.getElementById('res-touch-style')) {
      const s = document.createElement('style');
      s.id = 'res-touch-style';
      s.textContent = `
        @media (max-width: 820px) {
          .res-row {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            flex-wrap: wrap;
          }
          .res-row .res-left  { width: 100%; }
          .res-row .res-right { flex-shrink: 0; }
          .res-preview { display: none !important; }
          .res-row.open { background: #f8faff; border-radius: 10px; }
          [data-theme="dark"] .res-row.open { background: #1a2140; }
          .res-row.open .res-preview {
            display: block !important;
            position: static !important;
            opacity: 1 !important; visibility: visible !important;
            transform: none !important; width: 100% !important;
            box-shadow: none !important; backdrop-filter: none !important;
            border-radius: 10px; margin-top: 10px;
            border: 1px solid rgba(15,23,42,.1);
            background: #fff; flex-basis: 100%;
          }
          [data-theme="dark"] .res-row.open .res-preview {
            background: #16191f; border-color: rgba(255,255,255,.08);
          }
          .res-tap-hint {
            display: block; font-size: .68rem;
            color: #94a3b8; margin-top: 2px;
          }
          .res-row.open .res-tap-hint { display: none; }
        }
      `;
      document.head.appendChild(s);
    }

    document.querySelectorAll('.research-section-head p').forEach(p => {
      p.textContent = 'Tap for details & links';
    });

    rows.forEach(row => {
      if (row.dataset.touchReady) return;
      row.dataset.touchReady = '1';

    

      row.addEventListener('click', function (e) {
        if (window.innerWidth > 820) return;
        /* Let real link taps inside an open card navigate */
        if (e.target.closest('a') && row.classList.contains('open')) return;
        e.preventDefault();
        const isOpen = row.classList.contains('open');
        document.querySelectorAll('.res-row.open').forEach(r => r.classList.remove('open'));
        if (!isOpen) row.classList.add('open');
      });
    });
  }

  /* ══════════════════════════════════════════
     4. TEACHING TOUCH (tap whole row → expand;
        "Visit course ↗" button to navigate)
  ══════════════════════════════════════════ */
  function initTeachingTouch () {
    const items = document.querySelectorAll('.teach-flat-item');
    if (!items.length) return;

    if (!document.getElementById('teach-touch-style')) {
      const s = document.createElement('style');
      s.id = 'teach-touch-style';
      s.textContent = `
        @media (max-width: 820px) {
          .teach-flat-item {
            flex-wrap: wrap;
            cursor: pointer;
            border-radius: 10px;
            padding: .75rem .5rem;
            margin: 0 -.5rem;
            -webkit-tap-highlight-color: transparent;
            transition: background .12s;
          }
          .teach-flat-item:active { background: #f8faff; }
          [data-theme="dark"] .teach-flat-item:active { background: #1a2140; }
          .teach-flat-item.open  { background: #f8faff; }
          [data-theme="dark"] .teach-flat-item.open { background: #1a2140; }
          .teach-card:hover { transform: none !important; box-shadow: none !important; }

          /* Hide hover previews; show on .open */
          .link-preview { display: none !important; }
          .teach-flat-item.open .link-preview {
            display: block !important;
            position: static !important;
            opacity: 1 !important; visibility: visible !important;
            transform: none !important; width: 100% !important;
            flex-basis: 100%;
            pointer-events: auto !important;
            box-shadow: none !important; backdrop-filter: none !important;
            border-radius: 10px; margin-top: 10px;
            border: 1px solid rgba(15,23,42,.1);
            background: #fff;
          }
          [data-theme="dark"] .teach-flat-item.open .link-preview {
            background: #16191f; border-color: rgba(255,255,255,.08);
          }

          /* Remove the ↓ arrow since whole row is the tap target */
          .teach-link::after { content: '' !important; }

          /* "Visit course" button injected by JS */
          .teach-visit-btn {
            display: inline-flex; align-items: center; gap: 5px;
            margin-top: 10px; padding: 6px 14px;
            background: #2563eb; color: #fff !important;
            border-radius: 999px; font-size: .78rem; font-weight: 700;
            text-decoration: none !important;
            -webkit-tap-highlight-color: transparent;
          }
          .teach-visit-btn:hover { opacity: .85; }
        }
      `;
      document.head.appendChild(s);
    }

    document.querySelectorAll('.teaching-section-head p').forEach(p => {
      if (p.textContent.includes('Hover') || p.textContent.includes('Tap')) {
        p.textContent = 'Tap a course for details';
      }
    });

    items.forEach(item => {
      if (item.dataset.touchReady) return;
      item.dataset.touchReady = '1';

      const link    = item.querySelector('.teach-link');
      const preview = item.querySelector('.link-preview');

      /* Inject "Visit course ↗" button into the preview card */
      if (preview && link && !preview.querySelector('.teach-visit-btn')) {
        const btn = document.createElement('a');
        btn.className = 'teach-visit-btn';
        btn.href      = link.href;
        btn.target    = '_blank';
        btn.rel       = 'noopener';
        btn.innerHTML = 'Visit course ↗';
        (preview.querySelector('.link-preview-inner') ?? preview).appendChild(btn);
      }

      item.addEventListener('click', function (e) {
        if (window.innerWidth > 820) return;
        /* Let the "Visit course" button navigate */
        if (e.target.closest('.teach-visit-btn')) return;
        e.preventDefault();
        e.stopPropagation();
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.teach-flat-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ══ Boot ══ */
  function init () {
    injectToggle();
    interceptLinks();
    initResearchTouch();
    initTeachingTouch();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
