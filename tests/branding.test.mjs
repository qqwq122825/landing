import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/brand-settings.js',import.meta.url),'utf8');
const logoA='data:image/png;base64,fixtureA',logoB='data:image/webp;base64,fixtureB';
// Small DOM double for the shared branding contract, with no browser or network.
class Element {
 constructor(tag,attrs={},children=[]){this.nodeType=1;this.tagName=tag.toUpperCase();this.attrs={...attrs};this.style={objectFit:'',backgroundImage:''};this.children=[];this.textContent='';this.writes=0;children.forEach(child=>this.append(child));}
 append(child){child.parentElement=this;this.children.push(child);}
 getAttribute(key){return this.attrs[key]??null;}
 hasAttribute(key){return key in this.attrs;}
 setAttribute(key,value){this.attrs[key]=value;this.writes++;}
 removeAttribute(key){delete this.attrs[key];this.writes++;}
 matches(selector){return selector.split(',').some(s=>{s=s.trim();return s.startsWith('[')?this.hasAttribute(s.slice(1,-1)):this.tagName===s.toUpperCase();});}
 closest(selector){return this.matches(selector)?this:this.parentElement?.closest(selector)||null;}
 querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function fixture(nodes=[]){
 const root=new Element('html',{},nodes),tasks=[];let ready,observer,options;
 const document={documentElement:root,head:new Element('head'),querySelectorAll:selector=>root.querySelectorAll(selector),addEventListener(){}};
 const window={TV_SETTINGS_READY:{then:fn=>{ready=fn;}},addEventListener(type,fn){this[type]=fn;}};
 class Observer{constructor(fn){observer=fn;}observe(_,opts){options=opts;}}
 vm.runInNewContext(source,{document,window,MutationObserver:Observer,queueMicrotask:fn=>tasks.push(fn)});
 return {root,window,options,ready:config=>ready(config),settings:config=>window['tv:settings']({detail:config}),mutate(records){observer(records);while(tasks.length)tasks.shift()();}};
}

test('all marked brand images and favicon variants update repeatedly without touching other icons',()=>{
 const images=Array.from({length:5},()=>new Element('img',{'data-hub-logo':'',src:'default.png',srcset:'default@2x.png 2x',alt:'Default','data-src':'lazy-default.png'}));
 const icons=['icon','shortcut icon','apple-touch-icon'].map(rel=>new Element('link',{'data-hub-logo':'',rel,href:'old.ico',type:'image/x-icon',sizes:'32x32'}));
 const other=new Element('img',{src:'play.png',alt:'播放'}),name=new Element('span',{'data-hub-name':''});
 const f=fixture([...images,...icons,other,name]);f.ready({logoData:logoA,appName:'Alpha'});f.settings({logoData:logoB,appName:'Beta'});
 for(const image of images){assert.equal(image.getAttribute('src'),logoB);assert.equal(image.getAttribute('srcset'),null);assert.equal(image.getAttribute('data-src'),null);assert.equal(image.getAttribute('alt'),'Beta');assert.equal(image.style.objectFit,'contain');}
 for(const icon of icons){assert.equal(icon.getAttribute('href'),logoB);assert.equal(icon.getAttribute('type'),'image/webp');assert.equal(icon.getAttribute('sizes'),null);}
 assert.equal(other.getAttribute('src'),'play.png');assert.equal(name.textContent,'Beta');
 const writes=images[0].writes;f.settings({logoData:logoB,appName:'Beta'});assert.equal(images[0].writes,writes);
});

test('picture sources and background logos use the project image and restore their template defaults',()=>{
 const image=new Element('img',{'data-hub-logo':'',src:'default.png',srcset:'old.png 2x',alt:'Default'});
 const sourceNode=new Element('source',{srcset:'wide.webp 2x',sizes:'100vw','data-srcset':'lazy.webp 2x'});
 const picture=new Element('picture',{},[sourceNode,image]);
 const background=new Element('div',{'data-hub-logo':'background'});background.style.backgroundImage='url(default.png)';
 const icon=new Element('link',{'data-hub-logo':'',href:'default.ico',type:'image/x-icon',sizes:'32x32'});
 const f=fixture([picture,background,icon]);f.ready({logoData:logoA});
 assert.equal(sourceNode.getAttribute('srcset'),null);assert.equal(background.style.backgroundImage,`url("${logoA}")`);
 f.settings({logoData:''});
 assert.equal(image.getAttribute('src'),'default.png');assert.equal(image.getAttribute('srcset'),'old.png 2x');assert.equal(image.getAttribute('alt'),'Default');assert.equal(image.style.objectFit,'');
 assert.equal(sourceNode.getAttribute('srcset'),'wide.webp 2x');assert.equal(sourceNode.getAttribute('data-srcset'),'lazy.webp 2x');
 assert.equal(background.style.backgroundImage,'url(default.png)');assert.equal(icon.getAttribute('href'),'default.ico');assert.equal(icon.getAttribute('type'),'image/x-icon');assert.equal(icon.getAttribute('sizes'),'32x32');
});

test('new dialogs, lazy image rewrites and language changes retain current branding without Pixel initialization',()=>{
 const name=new Element('span',{'data-hub-name':''}),f=fixture([name]);f.ready({logoData:logoA,appName:'Alpha',preview:true,pixelId:'1000000000000001'});
 const image=new Element('img',{'data-hub-logo':'',src:'new-default.png'}),dialog=new Element('div',{},[image]);f.root.append(dialog);
 f.mutate([{type:'childList',target:f.root,addedNodes:[dialog]}]);assert.equal(image.getAttribute('src'),logoA);
 image.setAttribute('src','lazy-old.png');f.mutate([{type:'attributes',target:image,attributeName:'src'}]);assert.equal(image.getAttribute('src'),logoA);
 name.textContent='Original brand';f.mutate([{type:'characterData',target:{nodeType:3,parentElement:name}}]);assert.equal(name.textContent,'Alpha');
 assert.equal(f.window.fbq,undefined);assert.equal(f.options.characterData,true);
});

test('both templates explicitly mark every known brand image and favicon, not generic images',()=>{
 for(const [template,expected] of [['dptv',5],['feiyue',4]]){
  const html=readFileSync(new URL(`../resources/pages/${template}.html`,import.meta.url),'utf8');
  const tags=[...html.matchAll(/<(?:img|link)\b[^>]*>/g)].map(m=>m[0]);
  const branded=tags.filter(tag=>/dptv-logo\.png|image-images211d3420-|image-images8f9e3f90-/.test(tag));
  assert.equal(branded.filter(tag=>tag.startsWith('<img')).length,expected);
  for(const tag of branded)assert.match(tag,/data-hub-logo/);
  assert.equal(tags.filter(tag=>tag.startsWith('<img')&&tag.includes('data-hub-logo')).length,expected);
  assert.ok(html.includes('data-hub-name'));
 }
 assert.doesNotMatch(source,/img\[alt="logo"\]|img\[src\*="dptv-logo/);
});

test('image wordmarks are optional name slots and restore original markup when cleared',()=>{
 const wordmark=new Element('span',{'data-hub-wordmark':''});
 const original='<img data-hub-logo src="template-wordmark.webp" alt="Default">';
 let html=original,text='';
 Object.defineProperties(wordmark,{
  innerHTML:{get:()=>html,set:value=>{html=value;text='';}},
  textContent:{get:()=>text,set:value=>{text=value;html=value;}}
 });
 const f=fixture([wordmark]);
 f.ready({appName:'ReelShort',appNameOverride:'',logoData:''});assert.equal(wordmark.innerHTML,original);
 f.settings({appName:'Custom Brand',appNameOverride:'Custom Brand'});assert.equal(wordmark.textContent,'Custom Brand');
 f.settings({appName:'Second Brand',appNameOverride:'Second Brand'});assert.equal(wordmark.textContent,'Second Brand');
 wordmark.textContent='Translated default';f.mutate([{type:'childList',target:wordmark,addedNodes:[]}]);assert.equal(wordmark.textContent,'Second Brand');
 f.settings({appName:'ReelShort',appNameOverride:''});assert.equal(wordmark.innerHTML,original);
 f.settings({logoData:logoA});assert.equal(wordmark.innerHTML,original);
});

test('unfilled icon slots allow template lazy loaders and retain the latest default on reset',()=>{
 const img=new Element('img',{'data-hub-logo':'',src:'placeholder.png'}),f=fixture([img]);
 f.ready({logoData:''});img.setAttribute('src','loaded-template.png');
 f.mutate([{type:'attributes',target:img,attributeName:'src'}]);assert.equal(img.getAttribute('src'),'loaded-template.png');
 f.settings({logoData:logoA});assert.equal(img.getAttribute('src'),logoA);
 f.settings({logoData:''});assert.equal(img.getAttribute('src'),'loaded-template.png');
 img.setAttribute('src','new-template-resolution.png');f.mutate([{type:'attributes',target:img,attributeName:'src'}]);
 assert.equal(img.getAttribute('src'),'new-template-resolution.png');
 f.settings({logoData:logoB});f.settings({logoData:''});assert.equal(img.getAttribute('src'),'new-template-resolution.png');
});


test('admin branding forms permit empty names and offer an explicit icon reset',()=>{
 const tenant=readFileSync(new URL('../app/tenant.html',import.meta.url),'utf8');
 const master=readFileSync(new URL('../app/console.html',import.meta.url),'utf8');
 const masterJS=readFileSync(new URL('../public/assets/console.js',import.meta.url),'utf8');
 assert.doesNotMatch(tenant.match(/<input[^>]+id="app-name"[^>]*>/)[0],/required/);
 assert.doesNotMatch(master.match(/<input[^>]+name="appName"[^>]*>/)[0],/required/);
 assert.doesNotMatch(masterJS.match(/<input[^>]+name="appName"[^>]*>/)[0],/required/);
 assert.match(tenant,/id="reset-logo"/);assert.match(masterJS,/name="resetLogo"/);
 const css=readFileSync(new URL('../public/assets/tenant.css',import.meta.url),'utf8');
 assert.match(css,/input:not\(\[type=file\]\):not\(\[type=radio\]\):not\(\[type=checkbox\]\)/);
});
