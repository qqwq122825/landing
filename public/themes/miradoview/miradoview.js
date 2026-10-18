(() => {
  'use strict';
  const download=document.getElementById('download');
  document.querySelectorAll('[data-prompt-download],[data-scroll-download]').forEach(trigger=>trigger.addEventListener('click',event=>{
    event.preventDefault();
    download?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  const domain=document.querySelector('[data-hub-domain]');
  if(domain)domain.textContent=location.host;
})();
