/* ─────────────────────────────────────────────
   site.js  —  Yousef Kaddoura personal site
   • Page transitions (fast fade)
   • Dark mode toggle (persisted)
───────────────────────────────────────────── */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. DARK MODE
  ══════════════════════════════════════════ */
  const DARK_KEY = 'yk-theme';
  const html     = document.documentElement;

  /* Apply saved preference immediately (before paint) */
  const saved = localStorage.getItem(DARK_KEY);
  if (saved === 'dark') html.setAttribute('data-theme', 'dark');

  /* Inject toggle button into .top-nav once DOM is ready */
  function injectToggle () {
    const nav = document.querySelector('.top-nav');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.id = 'dm-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle dark mode');
    btn.innerHTML = currentIcon();
    btn.addEventListener('click', toggleTheme);
    nav.appendChild(btn);
  }

  function currentIcon () {
    const isDark = html.getAttribute('data-theme') === 'dark';
    return isDark
      /* sun */
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="5"/>
           <line x1="12" y1="1"  x2="12" y2="3"/>
           <line x1="12" y1="21" x2="12" y2="23"/>
           <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
           <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
           <line x1="1"  y1="12" x2="3"  y2="12"/>
           <line x1="21" y1="12" x2="23" y2="12"/>
           <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
           <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
         </svg>`
      /* moon */
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
  }

  function toggleTheme () {
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.setItem(DARK_KEY, 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem(DARK_KEY, 'dark');
    }
    const btn = document.getElementById('dm-toggle');
    if (btn) btn.innerHTML = currentIcon();
  }

 

  /* ── Run on DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }

})();
