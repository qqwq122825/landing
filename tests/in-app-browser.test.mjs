import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/in-app-browser.js',import.meta.url),'utf8');

class Element {
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.style={overflow:''};this.attrs={};this.dataset={};this.listeners={};this.textContent='';this.className='';}
  append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  remove(){this.parentElement.children=this.parentElement.children.filter(node=>node!==this);}
  setAttribute(name,value){this.attrs[name]=value;}
  getAttribute(name){return this.attrs[name]??null;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  focus(){this.focused=true;}
  closest(selector){return selector==='.download-link'&&this.className.includes('download-link')?this:null;}
  find(className){if(this.className===className)return this;for(const child of this.children){const found=child.find?.(className);if(found)return found;}return null;}
}

function fixture({userAgent='Mozilla/5.0 (Linux; Android 14) [FBAN/FB4A;FBAV/500.0]',language='zh-CN',preview=false,readyState='complete'}={}){
  const html=new Element('html'),body=new Element('body'),listeners={};html.append(body);let ready;
  const document={documentElement:html,body,readyState,activeElement:null,createElement:tag=>new Element(tag),addEventListener(type,fn,options){(listeners[type]??=[]).push({fn,options});}};
  const location={protocol:'https:',host:'example.test',pathname:'/p/abc123456',search:'?utm=fb',href:'https://example.test/p/abc123456?utm=fb'};
  const navigator={userAgent,language,clipboard:{writes:[],async writeText(value){this.writes.push(value);}}};
  const window={location,TV_PREVIEW:preview,TV_SETTINGS_READY:{then(fn){ready=fn;}},addEventListener(type,fn){this[type]=fn;}};
  vm.runInNewContext(source,{window,document,navigator});
  const dispatch=(type,event)=>{for(const {fn} of listeners[type]||[])fn(event);};
  const clickEvent=target=>({button:0,target,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}});
  return {window,document,navigator,body,listeners,ready:data=>ready?.(data),dispatch,clickEvent};
}

test('Facebook Android opens an automatic guide on actual landing pages',()=>{
  const f=fixture();f.ready({preview:false});
  const guide=f.body.find('hub-browser-guide');assert.ok(guide);
  assert.equal(guide.find('hub-browser-guide__card').attrs.role,'dialog');
  assert.equal(guide.find('hub-browser-guide__primary').textContent,'打开系统浏览器');
  assert.equal(f.document.documentElement.style.overflow,'hidden');
});

test('system-browser action uses an Android browsable intent for the same HTTPS page',()=>{
  const f=fixture();f.ready({preview:false});
  f.body.find('hub-browser-guide').find('hub-browser-guide__primary').listeners.click();
  assert.equal(f.window.location.href,'intent://example.test/p/abc123456?utm=fb#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end');
});

test('iOS copies the current link and keeps manual Safari instructions visible',async()=>{
  const f=fixture({userAgent:'Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/500.0]',language:'en-US'});f.ready({preview:false});
  const guide=f.body.find('hub-browser-guide'),button=guide.find('hub-browser-guide__primary');assert.equal(button.textContent,'Copy page link');
  await button.listeners.click();assert.deepEqual(f.navigator.clipboard.writes,['https://example.test/p/abc123456?utm=fb']);
  assert.match(button.textContent,/Link copied/);assert.match(guide.find('hub-browser-guide__manual').textContent,/top-right corner/);
});

test('previews and ordinary external browsers do not show the guide',()=>{
  const preview=fixture({preview:true});preview.ready({preview:true});assert.equal(preview.body.find('hub-browser-guide'),null);
  const chrome=fixture({userAgent:'Mozilla/5.0 Chrome/140.0.0.0 Mobile'});assert.equal(chrome.listeners.click,undefined);assert.equal(chrome.body.find('hub-browser-guide'),null);
});

test('closing is temporary and a real download click reopens the guide without navigating',()=>{
  const f=fixture();f.ready({preview:false});let guide=f.body.find('hub-browser-guide');guide.find('hub-browser-guide__close').listeners.click();
  assert.equal(f.body.find('hub-browser-guide'),null);assert.equal(f.document.documentElement.style.overflow,'');
  const link=new Element('a');link.className='download-link';const event=f.clickEvent(link);f.dispatch('click',event);
  assert.equal(event.prevented,true);assert.equal(event.stopped,true);assert.ok(f.body.find('hub-browser-guide'));
});

test('Facebook crawler user agents are excluded',()=>{
  const f=fixture({userAgent:'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'});assert.equal(f.listeners.click,undefined);assert.equal(f.body.find('hub-browser-guide'),null);
});
