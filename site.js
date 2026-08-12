(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. DARK MODE
     The theme is applied by an inline script in
     each page's <head> to avoid a white flash.
     This only handles the toggle button.
  ══════════════════════════════════════════ */
  const DARK_KEY = 'yk-theme';
  const html     = document.documentElement;

  function currentIcon () {
    return html.getAttribute('data-theme') === 'dark'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
           <circle cx="12" cy="12" r="4.5"/>
           <line x1="12" y1="1.5" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="22.5"/>
           <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
           <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
           <line x1="1.5" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="22.5" y2="12"/>
           <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
           <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
         </svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
  }

  function injectToggle () {
    if (document.getElementById('dm-toggle')) return;
    const nav = document.querySelector('.top-nav');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.id = 'dm-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Switch between light and dark');
    btn.innerHTML = currentIcon();
    btn.addEventListener('click', toggleTheme);
    nav.appendChild(btn);
  }

  function toggleTheme () {
    const isDark = html.getAttribute('data-theme') === 'dark';
    isDark ? html.removeAttribute('data-theme') : html.setAttribute('data-theme', 'dark');
    try { localStorage.setItem(DARK_KEY, isDark ? 'light' : 'dark'); } catch (e) {}
    const btn = document.getElementById('dm-toggle');
    if (btn) btn.innerHTML = currentIcon();
  }

  /* ══════════════════════════════════════════
     2. SPA NAVIGATION
     All styling now lives in style.css, so a page
     change is just a swap of .content-inner.
  ══════════════════════════════════════════ */
  const pageCache = {};
  let   navigating = false;
  const SPA_PAGES  = new Set(['index.html', 'research.html', 'teaching.html', 'code.html']);

  const transStyle = document.createElement('style');
  transStyle.textContent = `.main{transition:opacity .16s ease}.main.fading{opacity:0}`;
  document.head.appendChild(transStyle);

  function sleep (ms) { return new Promise(r => setTimeout(r, ms)); }

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
    await sleep(160);

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

    const newContent = doc.querySelector('.content-inner');
    const oldContent = document.querySelector('.content-inner');
    if (newContent && oldContent) oldContent.innerHTML = newContent.innerHTML;

    document.title = doc.title;
    updateActiveNav(url);
    if (pushState) history.pushState({ url }, '', url);
    window.scrollTo(0, 0);

    injectToggle();

    main.classList.remove('fading');
    navigating = false;
  }

  function updateActiveNav (url) {
    document.querySelectorAll('.top-nav a').forEach(a => {
      a.classList.remove('active');
      try {
        const aPath = new URL(a.href, location.href).pathname;
        const uPath = new URL(url,    location.href).pathname;
        if (aPath === uPath) a.classList.add('active');
      } catch {}
    });
  }

  function interceptLinks () {
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || !a.href) return;
      if (a.target === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
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

  /* ══ Boot ══ */
  function init () {
    injectToggle();
    interceptLinks();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
