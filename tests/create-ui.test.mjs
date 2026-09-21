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
const ids=['feiyue','dptv','quest'];
function fixture(post){
 const elements=new Map(),calls=[],checks=ids.map(value=>({value,checked:value!=='quest'}));
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
  reset(){checks.forEach(c=>c.checked=c.value!=='quest');sync(true);},
  submit:()=>form.emit('submit'),
 };
}

test('initial template choices follow grants, preserve valid selections and auto-select replacements',()=>{
 const f=fixture();assert.deepEqual(f.options(),['feiyue','dptv']);assert.equal(f.select.value,'feiyue');
 f.allow(['quest']);assert.deepEqual(f.options(),['quest']);assert.equal(f.select.value,'quest');assert.match(f.hint.textContent,/自动/);
 f.allow(['feiyue','quest']);assert.equal(f.select.value,'quest','adding another grant preserves the choice');
 f.allow(['feiyue']);assert.equal(f.select.value,'feiyue');
 f.allow(ids);f.select.value='dptv';f.allow(['dptv','quest']);assert.equal(f.select.value,'dptv');
 for(let mask=1;mask<8;mask++){
  const allowed=ids.filter((_,i)=>mask&(1<<i));f.allow(allowed);
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
  f.allow(allowed);f.reset();assert.deepEqual(f.options(),['feiyue','dptv']);assert.equal(f.select.value,'feiyue');assert.equal(f.button.disabled,false);
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
 assert.doesNotMatch(select[1],/value="quest"/);
 assert.match(html,/id="create-template-hint"[^>]*role="status"/);
});
