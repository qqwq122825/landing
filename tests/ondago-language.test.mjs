import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('resources/pages/ondago.html');
const script=read('public/themes/ondago/ondago.js');
const sandbox={window:{}};vm.runInNewContext(read('public/themes/ondago/i18n.js'),sandbox);
const dictionary=sandbox.window.ONDAGO_I18N;
const expected=['es','en','zh-CN','zh-TW','fr','de','ja','ko','pt','it','ru','ar','hi','id','th','vi','tr','nl','pl','sv','da','fi','ms','bn'];

test('OndagoTV has 24 complete explicit UI dictionaries, not a language-menu-only translation',()=>{
 assert.deepEqual(Object.keys(dictionary),expected);
 const keys=Object.keys(dictionary.es).sort();
 assert.equal(keys.length,16);
 for(const lang of expected){
  assert.deepEqual(Object.keys(dictionary[lang]).sort(),keys,lang);
  for(const key of keys)assert.equal(typeof dictionary[lang][key]==='string'&&dictionary[lang][key].trim().length>0,true,lang+':'+key);
  if(lang!=='es'){
   for(const key of ['download','description','weekly','about','install','info']){
    assert.notEqual(dictionary[lang][key],dictionary.es[key],lang+':'+key);
   }
  }
 }
 const used=[...html.matchAll(/data-i18n(?:-(?:aria-label|alt|content))?="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual([...new Set(used)].sort(),keys);
 const select=html.match(/<select id="ondago-language"[^>]*>([\s\S]*?)<\/select>/)[1];
 assert.deepEqual([...select.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),expected);
 assert.doesNotMatch(html,/<[^>]*data-hub-name[^>]*data-i18n|<[^>]*data-i18n[^>]*data-hub-name/);
 assert.equal((html.match(/\bdownload-link\b/g)||[]).length,5);
 assert.doesNotMatch(html,/__LANDING_RUNTIME__|data-dl|Mới phát hành/);
 assert.match(html,/i18n\.js\?v=20261112/);
 assert.match(html,/ondago\.js\?v=20261112/);
 assert.match(html,/theme\.css\?v=20261112/);
});

function run({query='',languages=['en-US'],saved,blocked=false,slug='fixture'}={}){
 const events={},links=[],settings={};let storedKey;
 const leaf={textContent:'',getAttribute:()=> 'download'};
 const selector={value:'',addEventListener:(type,fn)=>(events[type] ||= []).push(fn)};
 const root={lang:'es',dir:'ltr',classList:{add(){}}};
 const document={
  documentElement:root,
  querySelectorAll:selector=>selector==='[data-i18n]'?[leaf]:links,
  querySelector:()=>({...settings,addEventListener(){}}),
  getElementById:id=>id==='ondago-language'?selector:{classList:{toggle(){}},textContent:''},
 };
 const location={href:'https://fixture.invalid/p/'+slug+query,pathname:'/p/'+slug};
 const localStorage={getItem(key){storedKey=key;if(blocked)throw Error('blocked');return saved;},setItem(key,value){if(blocked)throw Error('blocked');storedKey=key;saved=value;}};
 const history={replaceState(a,b,value){location.href=String(value);}};
 const window={ONDAGO_I18N:dictionary,HUB_PAGE:{slug},scrollY:0,addEventListener(){}};
 vm.runInNewContext(script,{window,document,location,localStorage,history,navigator:{languages,language:languages[0]},URL,matchMedia:()=>({matches:true})});
 return {root,leaf,settings,selector,change:value=>{selector.value=value;events.change.forEach(fn=>fn({target:selector}));},location,key:()=>storedKey,saved:()=>saved};
}

test('OndagoTV language resolution: URL, project storage, preferred browser languages, then Spanish',()=>{
 for(const code of expected){
  const f=run({query:'?lang='+code});assert.equal(f.root.lang,code);assert.equal(f.leaf.textContent,dictionary[code].download);
  assert.equal(f.root.dir,code==='ar'?'rtl':'ltr');
 }
 assert.equal(run({query:'?lang=ko-KR',saved:'ar',languages:['fr-FR']}).root.lang,'ko');
 assert.equal(run({saved:'ar-SA',languages:['ko-KR']}).root.lang,'ar');
 assert.equal(run({languages:['xx','ko-KR','ar']}).root.lang,'ko');
 assert.equal(run({languages:['xx']}).root.lang,'pl');
 assert.equal(run({query:'?lang=unknown',saved:'ar',languages:['ko']}).root.lang,'pl');
 assert.equal(run({query:'?lang='}).root.lang,'pl');
 for(const tag of ['zh-TW','zh-HK','zh-MO','zh-Hant','zh-Hant-TW'])assert.equal(run({languages:[tag]}).root.lang,'zh-TW',tag);
 for(const tag of ['zh','zh-CN','zh-SG','zh-Hans-CN'])assert.equal(run({languages:[tag]}).root.lang,'zh-CN',tag);
 for(const tag of ['pt-BR','pt-PT'])assert.equal(run({languages:[tag]}).root.lang,'pt');
 assert.equal(run({blocked:true,languages:['ar']}).root.lang,'ar');
 assert.notEqual(run({slug:'alpha'}).key(),run({slug:'beta'}).key());
});

test('OndagoTV manual switching preserves path, ad parameters, hash and resets RTL without touching settings',()=>{
 const f=run({query:'?fbclid=keep&lang=ar#peliculas'});
 f.change('ko');
 assert.equal(f.root.lang,'ko');assert.equal(f.root.dir,'ltr');
 const url=new URL(f.location.href);
 assert.equal(url.pathname,'/p/fixture');assert.equal(url.searchParams.get('fbclid'),'keep');assert.equal(url.hash,'#peliculas');
 assert.equal(url.searchParams.get('lang'),'ko');assert.equal(f.saved(),'ko');
 f.change('ar');assert.equal(f.root.dir,'rtl');
 f.change('es');assert.equal(f.root.dir,'ltr');
 assert.match(f.key(),/fixture$/);
 assert.doesNotMatch(script,/fbq\(|fetch\(|sendBeacon\(|location\.(?:assign|replace)\(/);
});

test('OndagoTV routes only actual downloads and has local help disclosure',()=>{
 const css=read('public/themes/ondago/theme.css');
 assert.match(css,/html\[dir="rtl"\]/);
 assert.equal((html.match(/data-prompt-download/g)||[]).length,34);
 assert.equal((html.match(/data-hub-logo/g)||[]).length,4);
 assert.match(html,/data-hub-wordmark/);assert.match(html,/<dialog id="info-dialog"/);
 assert.match(read('app/bootstrap.php'),/const HUB_DEFAULT_TEMPLATES=\['feiyue','dptv'\]/);
 assert.doesNotMatch(script,/intent:\/\/|fbq\(|sendBeacon\(|fetch\(/);
});
