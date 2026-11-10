(() => {
  'use strict';

  const dictionary = window.LIV3ES_I18N;
  const normalize = value => {
    if (typeof value !== 'string') return null;
    const tag = value.trim().toLowerCase().replaceAll('_', '-');
    const base = tag.split('-')[0];
    const code = base === 'zh'
      ? (/^zh-(?:tw|hk|mo|hant)(?:-|$)/.test(tag) ? 'zh-TW' : 'zh-CN')
      : base;
    return dictionary && Object.prototype.hasOwnProperty.call(dictionary, code) ? code : null;
  };
  const storageKey = 'hub:liv3es:language:' + (window.HUB_PAGE?.slug || location.pathname);
  const url = new URL(location.href);
  let stored;
  try { stored = localStorage.getItem(storageKey); } catch {}
  const browserLanguage = [...(navigator.languages || []), navigator.language].map(normalize).find(Boolean);
  let language = url.searchParams.has('lang')
    ? normalize(url.searchParams.get('lang')) || 'es'
    : normalize(stored) || browserLanguage || 'es';

  function translate() {
    if (!dictionary) return;
    const entries = dictionary[language];
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Translate only explicit leaf slots. Brand names, destinations and media never change.
    for (const element of document.querySelectorAll('[data-i18n]')) {
      const value = entries[element.getAttribute('data-i18n')];
      if (typeof value === 'string') element.textContent = value;
    }
    for (const attribute of ['aria-label', 'alt', 'content']) {
      for (const element of document.querySelectorAll('[data-i18n-' + attribute + ']')) {
        const value = entries[element.getAttribute('data-i18n-' + attribute)];
        if (typeof value === 'string') element.setAttribute(attribute, value);
      }
    }
    document.getElementById('liv3es-language').value = language;
  }
  if (dictionary) {
    translate();
    document.querySelector('.language-picker').hidden = false;
    document.getElementById('liv3es-language').addEventListener('change', event => {
      language = normalize(event.target.value) || 'es';
      try { localStorage.setItem(storageKey, language); } catch {}
      const next = new URL(location.href);
      next.searchParams.set('lang', language);
      history.replaceState(null, '', next);
      // Keep anchors in this page after the query changes under the theme <base>.
      for (const link of document.querySelectorAll('a[href]:not(.download-link)')) {
        const destination = new URL(link.href);
        if (destination.origin === next.origin && destination.pathname === next.pathname && destination.hash) {
          destination.search = next.search;
          link.href = destination.href;
        }
      }
      translate();
    });
  }

  // The shared renderer sets a theme <base>; keep these links on this project or preview.
  for (const link of document.querySelectorAll('a[href^="#"]:not(.download-link)')) {
    const page = new URL(location.href);
    page.hash = link.getAttribute('href');
    link.href = page.href;
  }

  const header = document.getElementById('site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.documentElement.classList.add('reveal-enabled');
  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
    observer.observe(element);
  });
})();
