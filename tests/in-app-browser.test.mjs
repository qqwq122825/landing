import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/in-app-browser.js',import.meta.url),'utf8');

class Element {
  constructor(tag){this.tagName=tag.toUpperCase();this.attrs={};this.className='';this.children=[];}
  append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  setAttribute(name,value){this.attrs[name]=String(value);}
  getAttribute(name){return this.attrs[name]??null;}
  closest(selector){
    if(selector==='.download-link'&&this.className.split(/\s+/).includes('download-link'))return this;
    return this.parentElement?.closest?.(selector)||null;
  }
}

function fixture({userAgent='Mozilla/5.0 (Linux; Android 14) [FBAN/FB4A;FBAV/500.0]',preview=false}={}){
  const body=new Element('body'),listeners={};let ready;
  const document={body,addEventListener(type,fn){(listeners[type]??=[]).push(fn);}};
  const location={protocol:'https:',host:'example.test',pathname:'/p/abc123456',search:'?utm=fb',href:'https://example.test/p/abc123456?utm=fb'};
  const window={location,TV_PREVIEW:preview,TV_SETTINGS_READY:{then(fn){ready=fn;}},addEventListener(type,fn){this[type]=fn;}};
  vm.runInNewContext(source,{window,document,navigator:{userAgent},URL});
  const dispatch=(type,event)=>{for(const fn of listeners[type]||[])fn(event);};
  const clickEvent=target=>({button:0,target,prevented:false,propagationStopped:false,immediateStopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.propagationStopped=true;},stopImmediatePropagation(){this.immediateStopped=true;}});
  const link=(href='/p/abc123456/dl')=>{const node=new Element('a');node.className='download-link';node.href=new URL(href,location.href).href;node.setAttribute('href',href);return node;};
  return {window,document,body,listeners,ready:data=>ready?.(data),dispatch,clickEvent,link};
}

const settings={preview:false,downloadUrl:'/p/abc123456/dl'};

test('Facebook Android shows no automatic prompt or overlay',()=>{
  const f=fixture();f.ready(settings);
  assert.deepEqual(f.body.children,[]);
  assert.doesNotMatch(source,/hub-browser-guide|showPrompt|clipboard/);
});

test('download click directly opens its final project route through an Android browsable intent',()=>{
  const f=fixture();f.ready(settings);const event=f.clickEvent(f.link());f.dispatch('click',event);
  assert.equal(event.prevented,true);assert.equal(event.propagationStopped,true);assert.equal(event.immediateStopped,false);
  assert.equal(f.window.location.href,'intent://example.test/p/abc123456/dl#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end');
});

test('a nested download-button child resolves its server-rendered anchor destination',()=>{
  const f=fixture();f.ready(settings);const link=f.link('/p/abc123456/dl?campaign=fb'),icon=new Element('span');link.append(icon);
  const event=f.clickEvent(icon);f.dispatch('click',event);
  assert.equal(event.prevented,true);
  assert.equal(f.window.location.href,'intent://example.test/p/abc123456/dl?campaign=fb#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end');
});

test('iOS receives no prompt and keeps normal link behavior because APK delivery is Android-only',()=>{
  const f=fixture({userAgent:'Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/500.0]'});f.ready(settings);
  const event=f.clickEvent(f.link());f.dispatch('click',event);
  assert.equal(event.prevented,false);assert.equal(f.body.children.length,0);assert.equal(f.window.location.href,'https://example.test/p/abc123456?utm=fb');
});

test('previews, ordinary browsers, disabled controls and unrelated links are untouched',()=>{
  const preview=fixture({preview:true});preview.ready({...settings,preview:true});let event=preview.clickEvent(preview.link());preview.dispatch('click',event);assert.equal(event.prevented,false);
  const chrome=fixture({userAgent:'Mozilla/5.0 Chrome/140.0.0.0 Mobile'});assert.equal(chrome.listeners.click,undefined);
  const disabled=fixture();disabled.ready(settings);const link=disabled.link();link.setAttribute('aria-disabled','true');event=disabled.clickEvent(link);disabled.dispatch('click',event);assert.equal(event.prevented,false);
  const unrelated=new Element('a');event=disabled.clickEvent(unrelated);disabled.dispatch('click',event);assert.equal(event.prevented,false);
});

test('Facebook crawler user agents are excluded',()=>{
  const f=fixture({userAgent:'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'});assert.equal(f.listeners.click,undefined);
});
