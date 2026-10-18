(() => {
  'use strict';
  const download=document.getElementById('download');
  document.querySelectorAll('[data-prompt-download]').forEach(card=>card.addEventListener('click',()=>download?.scrollIntoView({behavior:'smooth',block:'start'})));
  const domain=document.querySelector('[data-hub-domain]');
  if(domain)domain.textContent=location.host;
})();
