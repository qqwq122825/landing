(() => {
  'use strict';

  const userAgent=navigator.userAgent||'';
  const isFacebookBrowser=/(?:FBAN|FBAV|FB_IAB|FBIOS|FB4A|Facebook|Instagram|Messenger)/i.test(userAgent)
    && !/facebookexternalhit/i.test(userAgent);
  if(!isFacebookBrowser)return;

  const isAndroid=/Android/i.test(userAgent);
  let enabled=false,settings=null;

  function configure(data){
    settings=data&&typeof data==='object'?data:null;
    enabled=!!settings&&!settings.preview&&!window.TV_PREVIEW;
  }
  function androidIntent(destination){
    let url;
    try{url=new URL(destination,window.location.href);}catch{return '';}
    if(!/^https?:$/.test(url.protocol))return '';
    const scheme=url.protocol.slice(0,-1);
    return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
  }
  function intercept(event){
    if(!enabled||!isAndroid||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const link=event.target?.closest?.('.download-link');
    if(!link||link.disabled||link.getAttribute('aria-disabled')==='true')return;
    const destination=link.href||link.getAttribute('href')||settings?.downloadUrl;
    const intent=androidIntent(destination);
    if(!intent)return;
    event.preventDefault();
    // Stop template click handlers (for example a download modal) while allowing
    // the other document-level capture listeners to record the download click.
    event.stopPropagation();
    window.location.href=intent;
  }
  document.addEventListener('click',intercept,true);
  window.addEventListener('tv:settings',event=>configure(event.detail));
  window.TV_SETTINGS_READY?.then(configure);
})();
