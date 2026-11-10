import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('resources/pages/liv3es.html');
const script=read('public/themes/liv3es/liv3es.js');
const sandbox={window:{}};vm.runInNewContext(read('public/themes/liv3es/i18n.js'),sandbox);
const dictionary=sandbox.window.LIV3ES_I18N;
const expected=['es','en','zh-CN','zh-TW','fr','de','ja','ko','pt','it','ru','ar','hi','id','th','vi','tr','nl','pl','sv','da','fi','ms','bn'];

test('Liv3es has 24 complete explicit UI dictionaries, not a language-menu-only translation',()=>{
 assert.deepEqual(Object.keys(dictionary),expected);
 const keys=Object.keys(dictionary.es).sort();
 assert.equal(keys.length,102);
 for(const lang of expected){
  assert.deepEqual(Object.keys(dictionary[lang]).sort(),keys,lang);
  for(const key of keys)assert.equal(typeof dictionary[lang][key]==='string'&&dictionary[lang][key].trim().length>0,true,lang+':'+key);
  if(lang!=='es'){
   for(const key of ['downloadApp','heroDescription','watch','filmIntro','seriesIntro','rights']){
    assert.notEqual(dictionary[lang][key],dictionary.es[key],lang+':'+key);
   }
  }
 }
 const used=[...html.matchAll(/data-i18n(?:-(?:aria-label|alt|content))?="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual([...new Set(used)].sort(),keys);
 const select=html.match(/<select id="liv3es-language"[^>]*>([\s\S]*?)<\/select>/)[1];
 assert.deepEqual([...select.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),expected);
 assert.doesNotMatch(html,/<[^>]*data-hub-name[^>]*data-i18n|<[^>]*data-i18n[^>]*data-hub-name/);
 assert.equal((html.match(/\bdownload-link\b/g)||[]).length,24);
 assert.doesNotMatch(html,/Ficha de la película/);
 assert.match(html,/i18n\.js\?v=20261110-i18n/);
 assert.match(html,/liv3es\.js\?v=20261110-i18n/);
 assert.match(html,/theme\.css\?v=20261110-i18n/);
});

function run({query='',languages=['en-US'],saved,blocked=false,slug='fixture'}={}){
 const events={},links=[],settings={};let storedKey;
 const leaf={textContent:'',getAttribute:()=> 'downloadApp'};
 const selector={value:'',addEventListener:(type,fn)=>events[type]=fn};
 const root={lang:'es',dir:'ltr',classList:{add(){}}};
 const document={
  documentElement:root,
  querySelectorAll:selector=>selector==='[data-i18n]'?[leaf]:links,
  querySelector:()=>settings,
  getElementById:id=>id==='liv3es-language'?selector:{classList:{toggle(){}}},
 };
 const location={href:'https://fixture.invalid/p/'+slug+query,pathname:'/p/'+slug};
 const localStorage={getItem(key){storedKey=key;if(blocked)throw Error('blocked');return saved;},setItem(key,value){if(blocked)throw Error('blocked');storedKey=key;saved=value;}};
 const history={replaceState(a,b,value){location.href=String(value);}};
 const window={LIV3ES_I18N:dictionary,HUB_PAGE:{slug},scrollY:0,addEventListener(){}};
 vm.runInNewContext(script,{window,document,location,localStorage,history,navigator:{languages,language:languages[0]},URL,matchMedia:()=>({matches:true})});
 return {root,leaf,settings,selector,change:value=>{selector.value=value;events.change({target:selector});},location,key:()=>storedKey,saved:()=>saved};
}

test('Liv3es language resolution: URL, project storage, preferred browser languages, then Spanish',()=>{
 for(const code of expected){
  const f=run({query:'?lang='+code});assert.equal(f.root.lang,code);assert.equal(f.leaf.textContent,dictionary[code].downloadApp);
  assert.equal(f.root.dir,code==='ar'?'rtl':'ltr');
 }
 assert.equal(run({query:'?lang=ko-KR',saved:'ar',languages:['fr-FR']}).root.lang,'ko');
 assert.equal(run({saved:'ar-SA',languages:['ko-KR']}).root.lang,'ar');
 assert.equal(run({languages:['xx','ko-KR','ar']}).root.lang,'ko');
 assert.equal(run({languages:['xx']}).root.lang,'es');
 assert.equal(run({query:'?lang=unknown',saved:'ar',languages:['ko']}).root.lang,'es');
 assert.equal(run({query:'?lang='}).root.lang,'es');
 for(const tag of ['zh-TW','zh-HK','zh-MO','zh-Hant','zh-Hant-TW'])assert.equal(run({languages:[tag]}).root.lang,'zh-TW',tag);
 for(const tag of ['zh','zh-CN','zh-SG','zh-Hans-CN'])assert.equal(run({languages:[tag]}).root.lang,'zh-CN',tag);
 for(const tag of ['pt-BR','pt-PT'])assert.equal(run({languages:[tag]}).root.lang,'pt');
 assert.equal(run({blocked:true,languages:['ar']}).root.lang,'ar');
 assert.notEqual(run({slug:'alpha'}).key(),run({slug:'beta'}).key());
});

test('Liv3es manual switching preserves path, ad parameters, hash and resets RTL without touching settings',()=>{
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

test('Liv3es retains server and shared download machinery, only its own presentation changes',()=>{
 const css=read('public/themes/liv3es/theme.css');
 assert.match(css,/html\[dir="rtl"\]/);
 assert.match(css,/\.language-picker\[hidden\]/);
 const labels=Object.values(dictionary).map(d=>d.language);
 assert.equal(labels.length,24);
 assert.match(read('bin/check.php'),/public\/themes\/liv3es\/i18n\.js/);
});
