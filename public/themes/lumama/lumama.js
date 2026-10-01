(() => {
  'use strict';
  // Posters and More Info only scroll; they are not download events.
  document.querySelectorAll('[data-prompt-download],[data-scroll-download]').forEach(node => {
    node.addEventListener('click', event => {
      event.preventDefault();
      document.getElementById('download')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
  document.querySelector('[data-scroll-top]')?.addEventListener('click',event => {
    event.preventDefault(); window.scrollTo({top:0,behavior:'smooth'});
  });
  document.querySelectorAll('[data-footer-placeholder]').forEach(node => {
    node.addEventListener('click',event => event.preventDefault());
  });
  document.querySelectorAll('[data-site-host]').forEach(node => node.textContent=location.host);
  // Only toggle visibility; public brand-settings.js owns the actual name/icon values.
  const update=data => document.body.classList.toggle('has-brand-logo',Boolean(data?.logoData));
  window.TV_SETTINGS_READY?.then(update);
  window.addEventListener('tv:settings',event => update(event.detail));
})();
