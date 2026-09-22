import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/console.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../app/console.html',import.meta.url),'utf8');
const start=source.indexOf(' function syncCreateTemplates(');
const end=source.indexOf('\n function setupSidebar(',start);
const bindStart=source.indexOf(" $('#create-form').addEventListener('change'");
const bindEnd=source.indexOf(" $('#copy-credentials')",bindStart);
assert.ok(start>=0&&end>start&&bindStart>=0&&bindEnd>bindStart);
const legacyIds=['feiyue','dptv','quest','aivideo'];
const ids=[...legacyIds,...JSON.parse(readFileSync(new URL('../docs/templates/reference-batch.json',import.meta.url),'utf8')).map(t=>t.id)];
function fixture(post){
 const elements=new Map(),calls=[],checks=ids.map(value=>({value,checked:['feiyue'].includes(value)}));
 const element=selector=>{
  if(!elements.has(selector))elements.set(selector,{value:'',innerHTML:'',textContent:'',disabled:false,listeners:new Map(),
   addEventListener(name,fn){this.listeners.set(name,fn);},
   emit(name,event={}){return this.listeners.get(name)?.({preventDefault(){},currentTarget:this,...event});},
  });
  return elements.get(selector);
 };
 const state={creating:false};
 const select=element('#create-form [name=template]'),button=element('#create-form [type=submit]');
 const form=element('#create-form'),hint=element('#create-template-hint');
 const context=vm.createContext({$:element,$$:()=>checks.filter(c=>c.checked),state,escape:String,templateName:id=>id,
  FormData:class {
   constructor(){this.entries=[['name','Fixture project'],['template',select.value],...checks.filter(c=>c.checked).map(c=>['allowedTemplates',c.value])];}
   [Symbol.iterator](){return this.entries[Symbol.iterator]();}
   getAll(name){return this.entries.filter(e=>e[0]===name).map(e=>e[1]);}
  },
  async post(path,body){calls.push({path,body:JSON.parse(JSON.stringify(body))});await post?.();return {project:{slug:'fixture'},credentials:{}};},
  hideModal(){},showCredentials(){},async overview(){},
 });
 const sync=vm.runInContext(source.slice(start,end)+'\n'+source.slice(bindStart,bindEnd)+'\nsyncCreateTemplates;',context);
 sync(true);
 return {select,button,hint,state,calls,element,
  options:()=>[...select.innerHTML.matchAll(/<option value="([^"]*)"/g)].map(m=>m[1]),
  allow(values){checks.forEach(c=>c.checked=values.includes(c.value));form.emit('change',{target:{name:'allowedTemplates'}});},
  reset(){checks.forEach(c=>c.checked=['feiyue'].includes(c.value));sync(true);},
  submit:()=>form.emit('submit'),
 };
}

test('initial template choices follow grants, preserve valid selections and auto-select replacements',()=>{
 const f=fixture();assert.deepEqual(f.options(),['feiyue']);assert.equal(f.select.value,'feiyue');
 f.allow(['quest']);assert.deepEqual(f.options(),['quest']);assert.equal(f.select.value,'quest');assert.match(f.hint.textContent,/自动/);
 f.allow(['feiyue','quest']);assert.equal(f.select.value,'quest','adding another grant preserves the choice');
 f.allow(['feiyue']);assert.equal(f.select.value,'feiyue');
 f.allow(ids);f.select.value='dptv';f.allow(['dptv','quest']);assert.equal(f.select.value,'dptv');
 for(let mask=1;mask<(1<<legacyIds.length);mask++){
  const allowed=legacyIds.filter((_,i)=>mask&(1<<i));f.allow(allowed);
  assert.deepEqual(f.options(),allowed);assert.ok(allowed.includes(f.select.value));assert.equal(f.button.disabled,false);
 }
});

test('empty grants disable initial selection and block creation, rechecking restores both',async()=>{
 const f=fixture();f.allow([]);
 assert.equal(f.select.value,'');assert.equal(f.select.disabled,true);assert.equal(f.button.disabled,true);
 assert.deepEqual(f.options(),['']);assert.match(f.hint.textContent,/至少勾选/);
 await f.submit();assert.equal(f.calls.length,0);
 f.allow(['quest']);assert.equal(f.select.disabled,false);assert.equal(f.button.disabled,false);
 await f.submit();assert.equal(f.calls.length,1);assert.deepEqual(f.calls[0],{path:'/projects',body:{name:'Fixture project',template:'quest',allowedTemplates:['quest']}});
});

test('reopening creation resets permissions and the initial choice instead of retaining a filtered dropdown',()=>{
 const f=fixture();
 for(const allowed of [['quest'],['dptv'],[]]){
  f.allow(allowed);f.reset();assert.deepEqual(f.options(),['feiyue']);assert.equal(f.select.value,'feiyue');assert.equal(f.button.disabled,false);
 }
 assert.match(source,/if\(a==='create'\)\{\$\('#create-form'\)\.reset\(\);syncCreateTemplates\(true\)/);
});

test('a pending request stays disabled after grant changes and rejects double submission',async()=>{
 let finish;const f=fixture(()=>new Promise(resolve=>finish=resolve));f.allow(['quest']);
 const pending=f.submit();f.allow(['feiyue','quest']);assert.equal(f.button.disabled,true);
 await f.submit();assert.equal(f.calls.length,1);assert.deepEqual(f.calls[0].body.allowedTemplates,['quest']);
 f.allow([]);finish();await pending;assert.equal(f.state.creating,false);assert.equal(f.button.disabled,true);
 f.allow(['dptv']);assert.equal(f.button.disabled,false);
});

test('request errors preserve the selected allowed template and allow retry',async()=>{
 let fail=true;const f=fixture(()=>{if(fail)throw Error('Fixture request failed');});f.allow(['quest']);
 await f.submit();assert.equal(f.element('#create-error').textContent,'Fixture request failed');
 assert.equal(f.select.value,'quest');assert.equal(f.button.disabled,false);assert.equal(f.state.creating,false);
 fail=false;await f.submit();assert.equal(f.calls.length,2);assert.equal(f.element('#create-error').textContent,'');
});

test('create form uses a required select and an accessible live hint with no ungranted initial option',()=>{
 const select=html.match(/<select[^>]*name="template"[^>]*>(.*?)<\/select>/s);
 assert.ok(select);assert.match(select[0],/required aria-describedby="create-template-hint"/);
 assert.doesNotMatch(select[1],/value="(?:quest|aivideo)"/);
 assert.match(html,/id="create-template-hint"[^>]*role="status"/);
});

test('all imported templates participate in initial-template grant selection',()=>{
 const f=fixture();
 for(const id of ids){f.allow([id]);assert.deepEqual(f.options(),[id]);assert.equal(f.select.value,id);f.allow(['feiyue',id]);assert.equal(f.select.value,id);f.allow(['feiyue']);assert.equal(f.select.value,'feiyue');}
});

test('new account form checks exactly one template by default',()=>{
 const checked=[...html.matchAll(/<input[^>]*name="allowedTemplates"[^>]*>/g)].filter(m=>/\bchecked\b/.test(m[0]));
 assert.equal(checked.length,1);assert.match(checked[0][0],/value="feiyue"/);
});

test('permission cards keep checkboxes separate from preview buttons and expose a single save toolbar',()=>{
 const renderer=source.slice(source.indexOf(' function templatePermissions('),source.indexOf(' function syncTemplatePermissions('));
 assert.match(renderer,/type="checkbox" name="allowedTemplates"/);
 assert.match(renderer,/type="button"[^>]*data-action="preview"/);
 assert.ok(renderer.indexOf('type="checkbox"')<renderer.indexOf('data-action="preview"'));
 assert.match(renderer,/id="template-permissions-save"/);
 assert.match(renderer,/aria-live="polite"/);
 assert.doesNotMatch(renderer,/collapse|template-permissions-panel/);
});

test('card grant drafts distinguish saved state, empty grants and current-template replacement',()=>{
 const checks=['feiyue','dptv','quest'].map(value=>({value,checked:value==='feiyue'}));
 const labels=new Map(checks.map(c=>['[data-permission-label="'+c.value+'"]',{textContent:'',classList:{toggle(){}}}]));
 const hint={textContent:''},save={},reset={};
 labels.set('#template-permissions-status',hint);labels.set('#template-permissions-save',save);labels.set('#template-permissions-reset',reset);
 const state={project:{template:'feiyue',allowedTemplates:['feiyue']}};
 const code=source.slice(source.indexOf(' function syncTemplatePermissions('),source.indexOf(' function drawBars('));
 const sync=vm.runInNewContext(code+';syncTemplatePermissions',{state,$:s=>labels.get(s),$$:()=>checks,templateIds:['feiyue','dptv','quest'],templateName:String});
 sync();assert.equal(save.disabled,true);assert.equal(reset.disabled,true);
 checks[2].checked=true;sync();assert.match(hint.textContent,/2 款 · 1 项待保存/);assert.equal(save.disabled,false);
 assert.equal(labels.get('[data-permission-label="quest"]').textContent,'待开放 · 未保存');
 assert.deepEqual(state.project.allowedTemplates,['feiyue']);
 checks[0].checked=false;sync();assert.match(hint.textContent,/保存后将自动切换至剩余开放模板/);
 assert.equal(labels.get('[data-permission-label="feiyue"]').textContent,'待取消开放 · 未保存');
 checks[2].checked=false;sync();assert.equal(save.disabled,true);assert.match(hint.textContent,/至少保留/);
 checks[0].checked=true;sync();assert.equal(save.disabled,true);assert.equal(reset.disabled,true);
});

test('select-all only updates checkboxes in the requested form and preserves initial selection',()=>{
 const checks=ids.map(value=>({value,checked:false}));let queried;
 const begin=source.indexOf(' function selectAllTemplates('),end=source.indexOf(' function syncTemplatePermissions(',begin);
 const selectAll=vm.runInNewContext(source.slice(begin,end)+';selectAllTemplates',{$$:selector=>{queried=selector;return checks;}});
 selectAll('#template-permissions-form');assert.equal(queried,'#template-permissions-form [name=allowedTemplates]');
 assert.ok(checks.every(c=>c.checked));assert.match(source,/id="template-permissions-all"/);
 assert.match(html,/data-action="create-select-all"/);
 const f=fixture();f.allow(['quest']);f.allow(ids);assert.equal(f.select.value,'quest');
});
