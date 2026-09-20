(function(){
"use strict";
/* ===== Hero featured carousel: restore behaviour lost in static export ===== */
var hero=document.querySelector('section[aria-label="Featured series"]');
if(hero){
  var toArr=function(nl){return Array.prototype.slice.call(nl);};
  var slides=toArr(hero.querySelectorAll('a[aria-hidden]')).filter(function(a){return a.className.indexOf('duration-600')>-1;});
  var dots=toArr(hero.querySelectorAll('button[aria-label^="Show "]'));
  var thumbs=toArr(hero.querySelectorAll('button[aria-label^="Preview "]'));
  var prevArrow=hero.querySelector('button[aria-label="Previous banner thumbnails"]');
  var nextArrow=hero.querySelector('button[aria-label="Next banner thumbnails"]');
  var N=slides.length, cur=0, offset=0, track=null, viewport=null;
  if(N>0 && dots.length===N && thumbs.length===N){
    track=thumbs[0].parentNode; viewport=track.parentNode;
    var setSlide=function(i){
      slides.forEach(function(a,idx){
        var on=idx===i;
        a.setAttribute('aria-hidden',on?'false':'true');
        if(on){a.removeAttribute('tabindex');}else{a.setAttribute('tabindex','-1');}
        a.classList.toggle('opacity-100',on);
        a.classList.toggle('z-1',on);
        a.classList.toggle('opacity-0',!on);
        a.classList.toggle('z-0',!on);
        a.classList.toggle('pointer-events-none',!on);
      });
    };
    var setDots=function(i){
      dots.forEach(function(b,idx){
        var on=idx===i;
        b.classList.toggle('w-32/vw',on);
        b.classList.toggle('w-12/vw',!on);
        var bar=b.querySelector('span');
        if(on){
          if(!bar){
            bar=document.createElement('span');
            bar.className='absolute inset-y-0 left-0 w-full origin-left bg-white rounded-2/vw';
            b.appendChild(bar);
          }
          bar.style.transform='scaleX(0)';
        }else if(bar){ b.removeChild(bar); }
      });
    };
    var setThumbs=function(i){
      thumbs.forEach(function(b,idx){
        var span=b.querySelector('span'); if(!span){return;}
        var on=idx===i;
        span.classList.toggle('border-white',on);
        span.classList.toggle('border-transparent',!on);
        span.classList.toggle('bg-black/40',on);
        span.classList.toggle('bg-transparent',!on);
        span.classList.toggle('duration-300',on);
        span.classList.toggle('duration-150',!on);
        span.classList.toggle('group-hover:duration-300',!on);
      });
    };
    var maxOffset=function(){ return Math.max(0, track.scrollWidth-viewport.clientWidth); };
    var setOffset=function(x){
      offset=Math.max(0,Math.min(x,maxOffset()));
      track.style.transform='translateX('+(-offset)+'px)';
    };
    var ensureVisible=function(i){
      if(!viewport.offsetParent){return;}
      var t=thumbs[i], l=t.offsetLeft, r=l+t.offsetWidth;
      if(l<offset){setOffset(l);}
      else if(r>offset+viewport.clientWidth){setOffset(r-viewport.clientWidth);}
    };
    var DUR=5000, elapsed=0, last=0, paused=false;
    var go=function(i){
      cur=((i%N)+N)%N;
      setSlide(cur); setDots(cur); setThumbs(cur); ensureVisible(cur);
      elapsed=0;
    };
    dots.forEach(function(b,idx){ b.addEventListener('click',function(){go(idx);}); });
    thumbs.forEach(function(b,idx){ b.addEventListener('click',function(){go(idx);}); });
    if(prevArrow){prevArrow.addEventListener('click',function(){setOffset(offset-viewport.clientWidth*0.8);});}
    if(nextArrow){nextArrow.addEventListener('click',function(){setOffset(offset+viewport.clientWidth*0.8);});}
    window.addEventListener('resize',function(){setOffset(offset);});
    hero.addEventListener('mouseenter',function(){paused=true;});
    hero.addEventListener('mouseleave',function(){paused=false;});
    hero.addEventListener('touchstart',function(){paused=true;},{passive:true});
    hero.addEventListener('touchend',function(){paused=false;});
    hero.addEventListener('touchcancel',function(){paused=false;});
    (function tick(ts){
      if(!last){last=ts;}
      var dt=ts-last; last=ts;
      if(!paused && document.visibilityState==='visible'){
        elapsed+=dt;
        if(elapsed>=DUR){ go(cur+1); }
        else{ var bar=dots[cur]&&dots[cur].querySelector('span'); if(bar){bar.style.transform='scaleX('+(elapsed/DUR)+')';} }
      }
      requestAnimationFrame(tick);
    })(0);
  }
}
/* ===== Back-to-top float button: restore click + scroll visibility ===== */
var topBtn=document.querySelector('button.CommonNavigationLayout_to_top_btn__VLUit');
if(topBtn){
  topBtn.style.transition='opacity .25s ease, transform .25s ease, visibility .25s ease';
  var syncTop=function(){
    var y=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0;
    if(y>400){
      topBtn.style.opacity='1'; topBtn.style.visibility='visible'; topBtn.style.transform='scale(1)';
    }else{
      topBtn.style.opacity='0'; topBtn.style.visibility='hidden'; topBtn.style.transform='scale(.85)';
    }
  };
  topBtn.addEventListener('click',function(){
    try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){window.scrollTo(0,0);}
  });
  window.addEventListener('scroll',syncTop,{passive:true});
  syncTop();
}
})();
