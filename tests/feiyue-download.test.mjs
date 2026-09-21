import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/themes/feiyue/assets/landing.js',import.meta.url),'utf8');
const brand=readFileSync(new URL('../public/assets/brand-settings.js',import.meta.url),'utf8');
const collector=readFileSync(new URL('../public/assets/collector.js',import.meta.url),'utf8');
function fixture({preview=false,pixelId='1000000000000001'}={}){
 const elements=[],calls=[],beacons=[],listeners={},windowListeners={},ready=[];
 class El {
  constructor(tag,attrs={}){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.childNodes=[];this.style={};this.events={};this.textContent='';this.clientWidth=300;this.scrollWidth=1000;this.classList={add:(...xs)=>{this.attrs.class=[...new Set([...(this.attrs.class||'').split(' ').filter(Boolean),...xs])].join(' ');},toggle(){}};elements.push(this);}
  get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}));}
  getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=String(v);}
  set href(v){this.attrs.href=v;}get href(){return this.attrs.href;}
  set className(v){this.attrs.class=v;}
  append(...nodes){for(const n of nodes){if(n.parent)n.parent.childNodes=n.parent.childNodes.filter(x=>x!==n);n.parent=this;this.childNodes.push(n);}}
  replaceWith(node){const p=this.parent;p.childNodes[p.childNodes.indexOf(this)]=node;node.parent=p;this.parent=null;}
  replaceChildren(...nodes){this.childNodes=[];this.append(...nodes);}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  showModal(){this.open=true;}close(){this.open=false;}
  querySelector(s){if(s==='[data-slider-poster]')return this.childNodes.find(n=>n.getAttribute('data-slider-poster'));if(s==='h3 a')return title;if(s==='h3')return {textContent:'Fixture drama'};if(s==='.Slider_sliderList__o0xyY')return track;return null;}
  closest(s){if(s==='.download-link'&&(this.attrs.class||'').split(' ').includes('download-link'))return this;if(s==='.Slider_sliderContainer__2F8gq'&&this===row)return this;return this.parent?.closest(s)||null;}
 }
 const row=new El('div'),track=new El('div'),book=new El('div'),poster=new El('div',{'data-slider-poster':'true',class:'BookItem_poster__CsSCp',style:'transform-origin:center'}),image=new El('img',{src:'fixture.jpg'}),title=new El('a',{href:'javascript:;'}),hero=new El('a',{href:'/?app=36&auto=android'});
 row.append(track);track.append(book);book.append(poster,title);poster.append(image);
 const config={appName:'ReelShort',downloadUrl:'/p/fixture01/dl',slug:'fixture01',preview,pixelId,visitId:'view1',token:'fixture-token',issued:123};
 const document={documentElement:{lang:'en'},visibilityState:'visible',body:new El('body'),head:new El('head'),createElement:tag=>new El(tag),querySelector:()=>null,
  querySelectorAll(s){if(s==='[class*="BookItem_bookItem"]')return [book];if(s==='a[href*="?app="], #rs-download-fab')return [hero];if(s==='a[href="javascript:;"]')return title.href==='javascript:;'?[title]:[];if(s==='.Slider_sliderContainer__2F8gq')return [row];if(s==='.download-link'||s==='a.download-link')return elements.filter(el=>el.tagName==='A'&&(el.attrs.class||'').split(' ').includes('download-link'));return [];},
  addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn);},
 };
 const window={APP_CONFIG:{appName:config.appName,apkUrl:config.downloadUrl},HUB_PAGE:config,TV_PREVIEW:preview,TV_SETTINGS_READY:{then:fn=>ready.push(fn)},fbq:(...args)=>calls.push(args),addEventListener:(t,f)=>{(windowListeners[t]??=[]).push(f);},dispatchEvent:e=>{for(const f of windowListeners[e.type]||[])f(e);}};
 const context={window,document,navigator:{sendBeacon:(url,b)=>{beacons.push({url,type:JSON.parse(b.data).type});return true;}},Blob:class{constructor(parts){this.data=parts.join('');}},CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}},performance:{now:()=>0},crypto:{randomUUID:()=>String(beacons.length)},setInterval(){}};
 vm.runInNewContext(source,context);vm.runInNewContext(brand,context);vm.runInNewContext(collector,context);ready.forEach(f=>f(config));
 const click=(target=image)=>{const e={button:0,target,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};for(const f of listeners.click||[]){f(e);if(e.stopped)break;}for(const f of target.events.click||[])if(!e.stopped)f(e);return {event:e,destination:e.prevented?null:target.closest('.download-link')?.href};};
 return {config,window,book,image,title,hero,poster:book.childNodes[0],row,click,calls,beacons,elements,settings:data=>window.dispatchEvent({type:'tv:settings',detail:data})};
}

test('ReelShort posters and titles are native project downloads, not modal triggers',()=>{
 const f=fixture();assert.equal(f.poster.tagName,'A');assert.equal(f.poster.childNodes[0],f.image);assert.equal(f.poster.getAttribute('style'),'transform-origin:center');assert.match(f.poster.getAttribute('class'),/BookItem_poster__CsSCp/);
 for(const target of [f.image,f.title,f.hero]){const result=f.click(target);assert.equal(result.destination,f.config.downloadUrl);assert.equal(result.event.prevented,undefined);}
 assert.ok(f.elements.filter(el=>el.tagName==='DIALOG').every(el=>!el.open));
 assert.deepEqual(f.calls,[['init',f.config.pixelId],['track','PageView'],...Array.from({length:3},()=>['trackCustom','DownloadClick'])]);
 assert.deepEqual(f.beacons.map(x=>x.type),['view','download','download','download']);
 f.settings({...f.config,downloadUrl:'/p/fixture02/dl'});assert.equal(f.poster.href,'/p/fixture02/dl');assert.equal(f.title.href,'/p/fixture02/dl');
});

test('ReelShort preview blocks poster navigation and all tracking; blank Pixel still allows downloading',()=>{
 const f=fixture({preview:true});assert.equal(f.click().destination,null);assert.deepEqual(f.calls,[]);assert.deepEqual(f.beacons,[]);
 const blank=fixture({pixelId:''});assert.equal(blank.click().destination,blank.config.downloadUrl);assert.deepEqual(blank.calls,[]);assert.deepEqual(blank.beacons.map(e=>e.type),['view','download']);
});

test('ReelShort swipe-generated clicks are suppressed before shared tracking and a new tap still works',()=>{
 const f=fixture();f.row.events.touchstart[0]({touches:[{clientX:200,clientY:100}]});f.row.events.touchend[0]({changedTouches:[{clientX:50,clientY:100}]});
 assert.equal(f.click().destination,null);assert.equal(f.calls.length,2);assert.deepEqual(f.beacons.map(e=>e.type),['view']);
 f.row.events.touchstart[0]({touches:[{clientX:50,clientY:100}]});f.row.events.touchend[0]({changedTouches:[{clientX:50,clientY:100}]});assert.equal(f.click().destination,f.config.downloadUrl);assert.equal(f.calls.length,3);
});
