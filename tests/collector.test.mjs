import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/collector.js',import.meta.url),'utf8');
const config={slug:'123456789',visitId:'fixture-visit',issued:123,token:'fixture-token',downloadUrl:'/p/123456789/dl',preview:false};
// Local VM doubles only: no browser, real network, real visitors or Meta SDK.
function fixture({page=config,signals={},beacon=true}={}){
 const listeners=new Map(),windowListeners=new Map(),requests=[],settings=[],timers=[],links=[{href:'old'}];let time=0,id=0;
 const add=(map,type,fn)=>map.set(type,[...(map.get(type)||[]),fn]);
 const document={visibilityState:'visible',querySelectorAll:()=>links,addEventListener:(type,fn)=>add(listeners,type,fn)};
 const window={HUB_PAGE:page,dispatchEvent:event=>settings.push(event),addEventListener:(type,fn)=>add(windowListeners,type,fn)};
 const navigator={...signals,sendBeacon:(url,blob)=>{if(beacon)requests.push({url,payload:JSON.parse(blob.data),transport:'beacon'});return beacon;}};
 class BlobDouble{constructor(parts){this.data=parts.join('');}}
 class EventDouble{constructor(type,init){this.type=type;this.detail=init.detail;}}
 const fetch=(url,options)=>{requests.push({url,payload:JSON.parse(options.body),transport:'fetch',options});return Promise.resolve();};
 vm.runInNewContext(source,{window,document,navigator,fetch,Blob:BlobDouble,CustomEvent:EventDouble,performance:{now:()=>time},crypto:{randomUUID:()=>`fixture-event-${++id}`},setInterval:fn=>timers.push(fn)});
 function click({type='click',button=0,download=true}={}){
  const event={button,target:{closest:()=>download?links[0]:null},preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
  for(const fn of listeners.get(type)||[])fn(event);return event;
 }
 return {requests,settings,links,timers,click,advance:ms=>{time+=ms;},visibility:state=>{document.visibilityState=state;for(const fn of listeners.get('visibilitychange')||[])fn();},pagehide:()=>{for(const fn of windowListeners.get('pagehide')||[])fn();}};
}

test('collector reports views, clicks and visible duration regardless of DNT or GPC',()=>{
 for(const signals of [{},{doNotTrack:'1'},{globalPrivacyControl:true},{doNotTrack:'1',globalPrivacyControl:true}]){
  const f=fixture({signals});assert.deepEqual(f.requests.map(r=>r.payload.type),['view']);
  f.advance(1500);f.click();f.click({type:'auxclick',button:1});f.visibility('hidden');
  assert.deepEqual(f.requests.map(r=>r.payload.type),['view','download','download','stay']);
  assert.equal(f.requests[0].payload.id,config.visitId);
  for(const r of f.requests){assert.equal(r.url,'/p/123456789/api/event');assert.equal(r.payload.visitId,config.visitId);assert.equal(r.payload.token,config.token);}
  assert.equal(f.requests.at(-1).payload.elapsed,1500);
  f.advance(1000);f.pagehide();assert.equal(f.requests.at(-1).payload.elapsed,1500);
  assert.equal(f.links[0].href,config.downloadUrl);assert.equal(f.settings.length,1);
 }
});

test('collector preview still blocks downloads and sends no statistics with browser signals set',()=>{
 const f=fixture({page:{...config,preview:true},signals:{doNotTrack:'1',globalPrivacyControl:true}});
 const click=f.click();assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 f.visibility('hidden');f.pagehide();assert.deepEqual(f.requests,[]);assert.equal(f.timers.length,0);
 assert.equal(f.links[0].href,config.downloadUrl);assert.equal(f.settings[0].detail.preview,true);
});

test('collector keeps fetch fallback and ignores controls unrelated to a download',()=>{
 const f=fixture({beacon:false,signals:{doNotTrack:'1',globalPrivacyControl:true}});
 f.click({download:false});f.click({type:'auxclick',button:2});assert.equal(f.requests.length,1);
 f.click();assert.deepEqual(f.requests.map(r=>r.payload.type),['view','download']);
 for(const r of f.requests){assert.equal(r.transport,'fetch');assert.equal(r.options.method,'POST');assert.equal(r.options.credentials,'omit');assert.equal(r.options.keepalive,true);}
});

test('collector stays inactive on pages without project configuration',()=>{
 const f=fixture({page:null});f.click();f.pagehide();assert.deepEqual(f.requests,[]);assert.equal(f.settings.length,0);assert.equal(f.timers.length,0);
});
