import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const file='Chaturbate MultiCam Pro + Cam ARNA.user.js',ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
const source=ref?execFileSync('git',['show',`${ref}:${file}`],{encoding:'utf8',maxBuffer:16e6}):readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
function block(a,b){const x=source.indexOf(a),y=source.indexOf(b,x+a.length);assert(x>=0&&y>x);return source.slice(x,y);}
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function fixture(enabled=true){
 const requests=[],counters=[];const items=Array.from({length:9},()=>{const classes=new Set();return {isConnected:true,dataset:{url:'https://example.invalid/{username}'},classList:{add(...x){x.forEach(v=>classes.add(v))},remove(...x){x.forEach(v=>classes.delete(v))},contains:v=>classes.has(v)}};});
 const c=vm.createContext({AbortController,searchRun:0,searchAbort:null,debounceTimer:0,suspendWhenInactive:enabled,active:true,selectedView:'search',resumeUser:'',lastSearchUser:'',lastAutoRoom:'alpha',mounted:true,input:{value:'alpha'},clearTimeout(){},document:{hidden:false},archiveGrid:{querySelectorAll:()=>items},isValidUsername:x=>!!x,saveHistory(){},updateCounter:(...args)=>counters.push(args),analyzeResponse:()=>true,
 GM_xmlhttpRequest(options){const handle={aborted:false,abort(){this.aborted=true;options.onabort?.();}};requests.push({options,handle});return handle;},mount(){},showView(){}});
 c.subTabs=new Map();c.views=new Map();c.loadHistory=()=>{};c.loadSavedProfiles=()=>{};
 vm.runInContext(block('    function activate(room)', '    function mount()')+block('    function showView(', '    function getValue(')+block('    function checkAll(', '    function updateCounter(')+block('    function checkPage(', '    function analyzeResponse(')+block('    function selectUsername(', '    function exportSavedProfiles('),c);
 return {c,requests,items,counters};
}
let passed=0;async function test(name,run){await run();passed++;console.log('PASS '+name);}
await test('closing aborts three active requests and admits no queued work',async()=>{const f=fixture();f.c.checkAll('alpha');await settle();assert.equal(f.requests.length,3);f.c.deactivate();await settle();assert(f.requests.every(r=>r.handle.aborted));assert.equal(f.requests.length,3);assert.equal(f.c.resumeUser,'alpha');});
await test('reopening preserves completed results and resumes only unfinished sites',async()=>{const f=fixture();f.c.checkAll('alpha');f.requests[0].options.onload({status:200});await settle();assert.equal(f.requests.length,4);f.c.deactivate();await settle();assert(f.items[0].classList.contains('found'));f.c.activate('alpha');await settle();assert.equal(f.requests.length,7);assert(f.items[0].classList.contains('found'));assert.equal(f.counters.at(-1)[0],1);});
await test('late aborted completion cannot update results',async()=>{const f=fixture();f.c.checkAll('alpha');f.c.deactivate();await settle();const count=f.counters.length;f.requests[0].options.onload({status:200});await settle();assert.equal(f.counters.length,count);assert(!f.items[0].classList.contains('found'));});
await test('hidden or inactive automatic work is deferred rather than dispatched',async()=>{const f=fixture();f.c.document.hidden=true;f.c.checkAll('alpha');await settle();assert.equal(f.requests.length,0);assert.equal(f.c.resumeUser,'alpha');f.c.document.hidden=false;f.c.activate('alpha');await settle();assert.equal(f.requests.length,3);});
await test('mobile opt-out retains prior lifecycle until its separate acceptance',async()=>{const f=fixture(false);f.c.checkAll('alpha');f.c.deactivate();await settle();assert(f.requests.every(r=>!r.handle.aborted));f.requests[0].options.onload({status:200});await settle();assert.equal(f.requests.length,4);});
await test('History selection B does not dispatch resumed A first',async()=>{const f=fixture();f.c.checkAll('alpha');f.c.showView('history');await settle();assert.equal(f.c.resumeUser,'alpha');f.c.selectUsername('beta');await settle();assert.equal(f.requests.length,6);assert(f.requests.slice(3).every(r=>r.options.url.endsWith('/beta')));});
console.log(`${passed} archive lifetime checks passed; synthetic GM request handles only.`);
