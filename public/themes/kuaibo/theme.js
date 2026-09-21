(() => {
 'use strict';
 const data = window.HUB_REFERENCE;
 if (!data?.locales) return;
 const buttons = [...document.querySelectorAll('.language-switcher .lang-btn')];
 let lang = data.defaultLanguage || 'en';
 function apply(code) {
  const pack = data.locales[code] || data.locales.en;
  lang = data.locales[code] ? code : 'en';
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-kb]').forEach(el => {
   const key = el.dataset.kb;
   if (pack[key]) el.textContent = pack[key];
  });
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
 }
 buttons.forEach(btn => btn.addEventListener('click', () => apply(btn.dataset.lang || 'en')));
 // Keep the page language aligned if the shared picker chooses zh/en.
 document.addEventListener('change', event => {
  if (event.target?.classList?.contains('hub-ref-language')) apply(event.target.value);
 });
 apply(lang);
})();
