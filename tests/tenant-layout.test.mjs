import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const css=readFileSync(new URL('../public/assets/tenant.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/assets/tenant.js',import.meta.url),'utf8');
test('tenant template grid uses available width with mobile and narrow-screen breakpoints',()=>{
 assert.doesNotMatch(css,/max-width:460px/);
 assert.match(css,/repeat\(auto-fill,minmax\(190px,1fr\)\)/);
 assert.match(css,/@media\(max-width:600px\)\{\.grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:360px\)\{\.grid\{grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/aspect-ratio:390\/530/);
 assert.match(css,/scale\(var\(--preview-scale,\.43\)\)/);
});
test('preview scale follows actual card width and ignores hidden cards',()=>{
 const widths=[0,147,198,280],values=[];
 const phones=widths.map((width,i)=>({getBoundingClientRect:()=>({width}),style:{setProperty:(key,value)=>values.push([i,key,Number(value)])}}));
 const begin=js.indexOf('  function resizeTemplatePreviews()'),end=js.indexOf("  if (typeof ResizeObserver",begin);
 const resize=vm.runInNewContext(js.slice(begin,end)+';resizeTemplatePreviews',{$$:()=>phones});
 resize();assert.deepEqual(values,widths.slice(1).map((w,i)=>[i+1,'--preview-scale',w/390]));
 assert.match(js,/new ResizeObserver\(resizeTemplatePreviews\)/);
});
