/* Local branding/locale adapter. No third-party tracking or translation requests. */
(() => {
  'use strict';
  const config = window.APP_CONFIG;
  window.LANDING_CFG = { appName: (window.APP_CONFIG.appName || config.appName) };
  window.deviceType = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Android' : 'Desktop';

  // Mark only real download/store CTAs, not posters, search, legal links or carousel arrows.
  // The unchanged shared tracker binds these elements after this script runs.
  document.querySelectorAll('[onclick*="downloadApp"], .vip-btn, .vip-btn-mobile, .sidebar-vip-btn, #desktopLoginBtn, #sidebarLoginBtn, #sidebarRegisterBtn, #mobileMenu a.font-semibold[onclick], .md-ru-store-btn, .download-modal__store-row a').forEach(el => {
    el.classList.add('download-link');
  });
  document.querySelectorAll('#mobileMenu a img').forEach(img => img.closest('a').classList.add('download-link'));
  document.querySelectorAll('a[href]').forEach(el => {
    if (el.getAttribute('href').startsWith('https://alphapundits.com/p/p6y2sej/dl')) el.href = config.apkUrl;
  });

  const languageAliases = { Deutsch: 'de', Français: 'fr', Español: 'es', Filipino: 'fil', Português: 'pt', 한국어: 'ko', ไทย: 'th', 'Bahasa Melayu': 'ms', 'Bahasa Indonesia': 'id', 日本語: 'ja', 简体中文: 'zh', 繁體中文: 'zh-tw' };
  const labels = { en: 'English', zh: '中文', 'zh-tw': '繁體中文', es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch', ru: 'Русский', fil: 'Filipino', ko: '한국어', th: 'ไทย', ms: 'Bahasa Melayu', id: 'Bahasa Indonesia', ja: '日本語' };
  function brand() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.parentElement?.tagName || '')) continue;
      node.nodeValue = node.nodeValue.replace(/MinuteDrama|Minute Drama/g, (window.APP_CONFIG.appName || config.appName));
    }
    document.title = (window.APP_CONFIG.appName || config.appName);
    document.querySelectorAll('img[alt="MinuteDrama"]').forEach(el => { el.alt = (window.APP_CONFIG.appName || config.appName); });
  }
  function setLanguage(lang) {
    window.LP_I18N.apply(lang, window.TV_LOCALES[lang] || {});
    brand();
    const current = document.getElementById('desktopCurrentLanguage');
    if (current) current.textContent = labels[lang] || lang.toUpperCase();
    document.querySelectorAll('.language-btn').forEach(el => {
      const selected = (languageAliases[el.dataset.lang] || el.dataset.lang) === lang;
      el.classList.toggle('text-[#FF4463]', selected);
      el.classList.toggle('text-gray-300', !selected);
    });
  }
  // Run after the reference's own DOMContentLoaded navbar initialization.
  function initLanguage() {
    let preference;
    try { preference = localStorage.getItem('dptv-language'); } catch {}
    const requested = new URLSearchParams(location.search).get('lang');
    const lang = window.LP_I18N.detect(requested || preference || navigator.language);
    setLanguage(lang);
    document.querySelectorAll('.language-btn').forEach(el => {
      el.addEventListener('click', event => {
        event.preventDefault();
        const next = languageAliases[el.dataset.lang] || el.dataset.lang || 'en';
        setLanguage(next);
        try { localStorage.setItem('dptv-language', next); } catch {}
        document.getElementById('desktopLanguageDropdown').style.display = 'none';
        const sidebar = document.getElementById('sidebarLanguageDropdown');
        sidebar.classList.add('hidden', 'opacity-0', 'invisible');
      });
    });
  }
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', initLanguage);
  else initLanguage();
})();
