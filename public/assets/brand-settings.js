(() => {
  'use strict';
  let pixelStarted=false;
  const trackingAllowed=()=>window.HUB_TRACKING_CONSENT!==false && navigator.doNotTrack!=='1' && !navigator.globalPrivacyControl;
  function startPixel(data) {
    if(pixelStarted || !/^\d{5,30}$/.test(data.pixelId||'') || data.preview || window.TV_PREVIEW || window.TV_REDIRECTING || !trackingAllowed())return;
    pixelStarted=true;
    // The project ID opts this landing page in; no disconnected consent flag is required.
    // Keep the standard Meta queue so clicks before the SDK finishes loading are retained.
    if(!window.fbq){
      const fbq=window.fbq=function(){fbq.callMethod?fbq.callMethod.apply(fbq,arguments):fbq.queue.push(arguments);};
      if(!window._fbq)window._fbq=fbq;
      fbq.push=fbq;fbq.loaded=true;fbq.version='2.0';fbq.queue=[];
      const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);
    }
    const fbq=window.fbq;
    fbq('init',data.pixelId);
    fbq('track','PageView');
    const download=event=>{
      if(!trackingAllowed() || window.TV_PREVIEW || window.TV_REDIRECTING)return;
      const link=event.target?.closest?.('.download-link');
      if(!link || link.disabled || link.getAttribute('aria-disabled')==='true')return;
      fbq('trackCustom','DownloadClick');
    };
    // Capture also covers JS download redirects and dynamically inserted download buttons.
    document.addEventListener('click',event=>{if(event.button===0)download(event);},true);
    document.addEventListener('auxclick',event=>{if(event.button===1)download(event);},true);
  }
  function apply(data) {
    if(!data || typeof data!=='object')return;
    if(data.appName){document.title=data.appName;document.querySelectorAll('[data-i18n="nav.brand"],.download-modal__brand h2,#download h1,.md-ru-footer__brand span').forEach(el=>el.textContent=data.appName);}
    if(data.logoData){
      document.querySelectorAll('img[alt="logo"],img[src*="dptv-logo.png"],img[class*="Footer_logo"]').forEach(img=>{img.removeAttribute('srcset');img.src=data.logoData;img.alt=data.appName||'logo';});
      let icon=document.querySelector('link[rel="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.append(icon);}icon.href=data.logoData;
    }
    startPixel(data);
  }
  window.addEventListener('tv:settings',e=>apply(e.detail));
  window.TV_SETTINGS_READY?.then(data=>{if(data)apply(data);});
})();
