import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/assets/console.js',import.meta.url),'utf8');
const openStart=source.indexOf(' function openDeleteProject(');
const openEnd=source.indexOf('\n document.addEventListener',openStart);
const bindStart=source.indexOf(" $('#delete-confirm-slug').addEventListener('input'");
const bindEnd=source.indexOf(" $('#legacy-reset-credentials')",bindStart);
assert.ok(openStart>=0&&openEnd>openStart&&bindStart>=0&&bindEnd>bindStart);
function fixture(options={}){
 const slug='123456789',elements=new Map(),calls=[],messages=[];
 let visible=false,refreshes=0;
 const element=selector=>{
  if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',disabled:false,hidden:false,listeners:new Map(),
   addEventListener(name,fn){this.listeners.set(name,fn);},emit(name,event={preventDefault(){}}){return this.listeners.get(name)?.(event);},focus(){},
   classList:{contains:()=>visible},reset(){element('#delete-confirm-slug').value='';}});
  return elements.get(selector);
 };
 const close=[element('close'),element('cancel')];
 const state={projects:[{slug,name:'Fixture project'},{slug:'987654321',name:'Kept project'}],view:'overview',deleteSlug:null,deleting:false};
 const hide=()=>{let prevented=false;element('#delete-dialog').emit('hide.bs.modal',{preventDefault(){prevented=true;}});if(!prevented)visible=false;return !prevented;};
 const context=vm.createContext({$:element,$$:()=>close,state,isSuper:true,
  showModal(){visible=true;},hideModal:hide,renderRows(){},toast:message=>messages.push(message),
  async post(path,body){calls.push({path,body:JSON.parse(JSON.stringify(body))});return options.post?.(element);},
  async overview(){refreshes++;return options.overview?.();},
 });
 const {openDeleteProject}=vm.runInContext(source.slice(openStart,openEnd)+'\n'+source.slice(bindStart,bindEnd)+'\n({openDeleteProject});',context);
 openDeleteProject(slug);
 return {slug,state,calls,messages,element,hide,open:()=>openDeleteProject(slug),visible:()=>visible,refreshes:()=>refreshes,
  enter(value){element('#delete-confirm-slug').value=value;element('#delete-confirm-slug').emit('input');},
  submit:()=>element('#delete-form').emit('submit'),
 };
}
test('delete confirmation requires an exact identifier and cancelling clears the choice',async()=>{
 const f=fixture();assert.equal(f.element('#delete-submit').disabled,true);
 for(const value of ['', 'wrong', ' '+f.slug]){f.enter(value);await f.submit();assert.equal(f.calls.length,0);}
 f.enter(f.slug);assert.equal(f.element('#delete-submit').disabled,false);
 assert.equal(f.hide(),true);assert.equal(f.state.deleteSlug,null);assert.equal(f.element('#delete-confirm-slug').value,'');
 f.open();assert.equal(f.element('#delete-submit').disabled,true);
});
test('pending deletion blocks double submission and accidental modal dismissal',async()=>{
 let finish;const f=fixture({post:()=>new Promise(resolve=>finish=resolve)});f.enter(f.slug);
 const pending=f.submit();await f.submit();assert.equal(f.calls.length,1);assert.equal(f.hide(),false);
 assert.equal(f.element('#delete-confirm-slug').disabled,true);
 finish();await pending;assert.equal(f.visible(),false);assert.equal(f.state.deleting,false);
 assert.equal(f.refreshes(),1);assert.deepEqual(f.state.projects.map(p=>p.slug),['987654321']);
 assert.deepEqual(f.calls,[{path:'/projects/'+f.slug+'/delete',body:{confirmSlug:f.slug}}]);
});
test('failed deletion retains a retryable confirmation without reporting success',async()=>{
 let fail=true;const f=fixture({post:()=>{if(fail)throw Error('Fixture request failed');}});f.enter(f.slug);
 await f.submit();assert.equal(f.visible(),true);assert.equal(f.state.projects.length,2);
 assert.equal(f.element('#delete-error').textContent,'Fixture request failed');assert.equal(f.element('#delete-submit').disabled,false);
 assert.equal(f.messages.length,0);fail=false;await f.submit();assert.equal(f.visible(),false);assert.equal(f.refreshes(),1);
});
test('expired login closes the confirmation after the pending request ends',async()=>{
 const f=fixture({post:element=>{element('#shell').hidden=true;throw Error('请登录后继续');}});f.enter(f.slug);await f.submit();
 assert.equal(f.visible(),false);assert.equal(f.state.deleteSlug,null);assert.equal(f.state.deleting,false);
});
test('a refresh failure after successful deletion never leaves a stale delete row or reports deletion failure',async()=>{
 const f=fixture({overview:()=>{throw Error('Fixture refresh failed');}});f.enter(f.slug);await f.submit();
 assert.equal(f.visible(),false);assert.deepEqual(f.state.projects.map(p=>p.slug),['987654321']);
 assert.equal(f.messages.at(-1),'项目已删除，列表刷新失败，请点击刷新');
});
