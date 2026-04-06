(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. DARK MODE
  ══════════════════════════════════════════ */
  const DARK_KEY = 'yk-theme';
  const html     = document.documentElement;

  const saved = localStorage.getItem(DARK_KEY);
  if (saved === 'dark') html.setAttribute('data-theme', 'dark');

  function injectToggle () {
    const nav = document.querySelector('.top-nav');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.id = 'dm-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title',       'Toggle dark mode');
    btn.innerHTML = currentIcon();
    btn.addEventListener('click', toggleTheme);
    /* ── Place it right before the CV button ── */
    const cv = nav.querySelector('.btn-cv');
    if (cv) nav.insertBefore(btn, cv);
    else    nav.appendChild(btn);
  }

  function currentIcon () {
    const isDark = html.getAttribute('data-theme') === 'dark';
    return isDark
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

  /* ══════════════════════════════════════════
     2. MOBILE TOUCH — RESEARCH PAGE
     .res-preview is display:none on mobile.
     Tap a row to expand it inline; tap again to close.
     Tapping a link inside an open preview works normally.
  ══════════════════════════════════════════ */
  function initResearchTouch () {
    const rows = document.querySelectorAll('.res-row');
    if (!rows.length) return;

    /* Inject the open-state styles once */
    const s = document.createElement('style');
    s.textContent = `
      @media (max-width: 820px) {
        .res-preview {
          display: none;
          position: static !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
          width: 100% !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          border-radius: 10px;
          margin-top: 10px;
          border: 1px solid rgba(15,23,42,.08);
          background: #fff;
        }
        [data-theme="dark"] .res-preview { background: #16191f; }
        .res-row.open .res-preview  { display: block !important; }
        .res-row.open               { background: #f8faff; border-radius: 10px; }
        [data-theme="dark"] .res-row.open { background: #1a2140; }
        .res-row                    { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .res-tap-hint               { display: block; font-size:.68rem; color:#94a3b8; margin-top:3px; }
        .res-row.open .res-tap-hint { display: none; }
      }
    `;
    document.head.appendChild(s);

    /* Update the section hint text */
    document.querySelectorAll('.research-section-head p').forEach(p => {
      p.textContent = 'Tap for details & links';
    });

    rows.forEach(row => {
      /* Add a small "tap" hint under each title */
      const hint = document.createElement('span');
      hint.className = 'res-tap-hint';
      hint.textContent = 'Tap for details';
      const left = row.querySelector('.res-left');
      if (left) left.appendChild(hint);

      row.addEventListener('click', function (e) {
        /* If they tapped a real link inside an open preview, let it navigate */
        if (e.target.closest('a')) return;

        const isOpen = row.classList.contains('open');
        /* Close all others */
        document.querySelectorAll('.res-row.open').forEach(r => r.classList.remove('open'));
        /* Toggle this one */
        if (!isOpen) row.classList.add('open');
      });
    });
  }

  /* ══════════════════════════════════════════
     3. MOBILE TOUCH — TEACHING PAGE
     .link-preview is display:none on mobile.
     First tap on a course title shows the preview.
     Second tap follows the link.
  ══════════════════════════════════════════ */
  function initTeachingTouch () {
    const wraps = document.querySelectorAll('.teach-title-wrap');
    if (!wraps.length) return;

    const s = document.createElement('style');
    s.textContent = `
      @media (max-width: 820px) {
        .link-preview {
          display: none;
          position: static !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
          width: 100% !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          pointer-events: auto !important;
          border-radius: 10px;
          margin-top: 8px;
          border: 1px solid rgba(15,23,42,.08);
          background: #fff;
        }
        [data-theme="dark"] .link-preview { background: #16191f; }
        .teach-title-wrap.open .link-preview { display: block !important; }
        .teach-link::after {
          content: ' ↓';
          font-size: .75em;
          opacity: .45;
        }
        .teach-title-wrap.open .teach-link::after { content: ' ↑'; }
      }
    `;
    document.head.appendChild(s);

    /* Update hint text */
    document.querySelectorAll('.teaching-section-head p').forEach(p => {
      if (p.textContent.includes('Hover')) p.textContent = 'Tap title for preview · tap again to open';
    });

    wraps.forEach(wrap => {
      const link = wrap.querySelector('.teach-link');
      if (!link) return;

      link.addEventListener('click', function (e) {
        /* Only intercept on narrow screens */
        if (window.innerWidth > 820) return;

        if (!wrap.classList.contains('open')) {
          /* First tap: show preview, don't navigate */
          e.preventDefault();
          document.querySelectorAll('.teach-title-wrap.open').forEach(w => w.classList.remove('open'));
          wrap.classList.add('open');
        }
        /* Second tap: preview already open → let the link navigate normally */
      });
    });
  }

  /* ══ Boot ══ */
  function init () {
    injectToggle();
    initResearchTouch();
    initTeachingTouch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
