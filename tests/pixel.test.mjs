import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/brand-settings.js',import.meta.url),'utf8');
const config={pixelId:'1000000000000001',preview:false};
// Pure unit doubles: no browser or network, and no requests to a real Meta account.
function fixture({navigator={},globals={}}={}){
 const listeners=new Map(),scripts=[];let ready;
 const document={
  querySelectorAll:()=>[],querySelector:()=>null,createElement:tag=>({tag}),
  head:{append:element=>scripts.push(element)},
  addEventListener(type,fn,capture){const items=listeners.get(type)||[];items.push({fn,capture});listeners.set(type,items);},
 };
 const window={...globals,addEventListener(type,fn){this[type]=fn;},TV_SETTINGS_READY:{then(fn){ready=fn;}}};
 vm.runInNewContext(source,{window,document,navigator});
 const click=({type='click',button=0,download=true,disabled=false,ariaDisabled=false}={})=>{
  const link={disabled,getAttribute:name=>name==='aria-disabled'&&ariaDisabled?'true':null};
  const event={button,target:{closest:selector=>download&&selector==='.download-link'?link:null}};
  for(const {fn} of listeners.get(type)||[])fn(event);
 };
 return {window,document,navigator,scripts,listeners,click,settings:data=>window['tv:settings']({detail:data}),ready:data=>ready(data),calls:()=>Array.from(window.fbq?.queue||[],args=>Array.from(args))};
}

test('valid Pixel ID initializes and queues PageView without an extra consent flag',()=>{
 const f=fixture();f.ready(config);
 assert.equal(f.window.HUB_TRACKING_CONSENT,undefined);
 assert.equal(f.scripts.length,1);assert.equal(f.scripts[0].src,'https://connect.facebook.net/en_US/fbevents.js');assert.equal(f.scripts[0].async,true);
 assert.deepEqual(f.calls(),[['init',config.pixelId],['track','PageView']]);
 assert.equal(f.window._fbq,f.window.fbq);assert.equal(f.window.fbq.push,f.window.fbq);assert.equal(f.window.fbq.version,'2.0');
});

test('ready promise plus repeated settings events initialize once and bind once',()=>{
 const f=fixture();f.settings(config);f.ready(config);f.settings(config);
 assert.equal(f.scripts.length,1);assert.equal(f.calls().filter(c=>c[1]==='PageView').length,1);
 assert.equal(f.listeners.get('click').length,1);assert.equal(f.listeners.get('auxclick').length,1);
});

test('blank or invalid Pixel IDs never load the SDK or bind event handlers',()=>{
 for(const pixelId of ['',undefined,'abc','1234','1'.repeat(31),'12345<script>']){
  const f=fixture();f.ready({...config,pixelId});assert.equal(f.scripts.length,0);assert.equal(f.window.fbq,undefined);assert.equal(f.listeners.size,0);
 }
});

test('preview, redirect and explicit site opt-out still suppress initialization with browser signals set',()=>{
 const cases=[{data:{...config,preview:true}},{globals:{TV_PREVIEW:true}},{globals:{TV_REDIRECTING:true}},{globals:{HUB_TRACKING_CONSENT:false}}];
 for(const {data=config,...options} of cases){const f=fixture({...options,navigator:{doNotTrack:'1',globalPrivacyControl:true}});f.ready(data);assert.equal(f.scripts.length,0);assert.deepEqual(f.calls(),[]);}
});

test('DNT and GPC no longer suppress Pixel PageView or DownloadClick',()=>{
 for(const navigator of [{doNotTrack:'1'},{globalPrivacyControl:true},{doNotTrack:'1',globalPrivacyControl:true}]){
  const f=fixture({navigator});f.ready(config);f.settings(config);f.click();f.click({type:'auxclick',button:1});
  assert.equal(f.scripts.length,1);
  assert.deepEqual(f.calls(),[['init',config.pixelId],['track','PageView'],['trackCustom','DownloadClick'],['trackCustom','DownloadClick']]);
 }
});

test('download clicks and middle-clicks are captured; unrelated and disabled buttons are ignored',()=>{
 const f=fixture();f.ready(config);assert.equal(f.listeners.get('click')[0].capture,true);
 f.click({download:false});f.click({disabled:true});f.click({ariaDisabled:true});f.click({button:2});f.click({type:'auxclick',button:2});
 assert.equal(f.calls().length,2);
 f.click();f.click({type:'auxclick',button:1});
 assert.deepEqual(f.calls().slice(2),[['trackCustom','DownloadClick'],['trackCustom','DownloadClick']]);
});

test('delegated handler supports nested and dynamically added download controls before SDK load',()=>{
 const f=fixture();f.ready(config);
 for(let i=0;i<3;i++)f.click();
 assert.equal(f.calls().filter(c=>c[1]==='DownloadClick').length,3);assert.equal(f.scripts.length,1);
});

test('separate landing pages initialize their own project Pixel IDs',()=>{
 const a=fixture(),b=fixture();a.ready(config);b.ready({...config,pixelId:'2000000000000002'});
 assert.deepEqual(a.calls()[0],['init','1000000000000001']);assert.deepEqual(b.calls()[0],['init','2000000000000002']);
 a.click();assert.equal(b.calls().length,2);
});

test('existing SDK is reused without injecting a second script',()=>{
 const calls=[],fbq=(...args)=>calls.push(args),f=fixture({globals:{fbq}});f.ready(config);f.click();
 assert.equal(f.scripts.length,0);assert.equal(f.window.fbq,fbq);assert.deepEqual(calls,[['init',config.pixelId],['track','PageView'],['trackCustom','DownloadClick']]);
});

test('explicit opt-out may be lifted later through settings, without duplicate PageViews',()=>{
 const f=fixture({globals:{HUB_TRACKING_CONSENT:false}});f.ready(config);assert.equal(f.scripts.length,0);
 f.window.HUB_TRACKING_CONSENT=true;f.settings(config);assert.equal(f.scripts.length,1);
 f.window.HUB_TRACKING_CONSENT=false;f.click();assert.equal(f.calls().length,2);
 f.window.HUB_TRACKING_CONSENT=true;f.settings(config);f.click();assert.equal(f.calls().length,3);
});

test('later browser signal changes do not stop downloads; explicit site opt-out and preview still do',()=>{
 const f=fixture();f.ready(config);f.navigator.globalPrivacyControl=true;f.navigator.doNotTrack='1';f.click();
 f.window.HUB_TRACKING_CONSENT=false;f.click();f.window.HUB_TRACKING_CONSENT=true;
 f.window.TV_PREVIEW=true;f.click();f.window.TV_PREVIEW=false;f.window.TV_REDIRECTING=true;f.click();
 assert.deepEqual(f.calls(),[['init',config.pixelId],['track','PageView'],['trackCustom','DownloadClick']]);
});

test('irrelevant empty settings events are harmless and do not start tracking',()=>{
 const f=fixture();f.settings(null);f.settings(undefined);f.settings('invalid');assert.equal(f.scripts.length,0);f.ready(config);assert.equal(f.scripts.length,1);
});
