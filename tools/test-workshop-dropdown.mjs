// Extracted production dropdown controller; controlled DOM/message/async boundaries.
// Shared full-Workshop media/refresh/grid checks remain in their dedicated suites.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js',import.meta.url),'utf8');
function block(a,b){let i=source.indexOf(a),j=source.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return source.slice(i,j)}
class Target{
 constructor(){this.listeners=new Map()}
 addEventListener(k,f){const a=this.listeners.get(k)||[];a.push(f);this.listeners.set(k,a)}
 emit(k,e={}){return Promise.all((this.listeners.get(k)||[]).map(f=>f({target:this,preventDefault(){},...e})))}
}
function fixture(){
 const timers=new Map(),messages=[],notices=[];
 let timer=0;
 class Element extends Target{
  constructor(tag){super();this.tagName=tag;this.children=[];this.style={};this.attrs={};this.rect={left:100,top:20,bottom:50};if(tag==='iframe')this.contentWindow={postMessage:(...args)=>messages.push(args)}}
  append(...items){for(const item of items){item.parent=this;this.children.push(item)}}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null}
  get isConnected(){return this===doc.body||this===doc.head||!!this.parent?.isConnected}
  contains(el){return el===this||this.children.some(x=>x.contains(el))}
  setAttribute(k,v){this.attrs[k]=v}
  getBoundingClientRect(){return this.rect}
  focus(){this.focused=true}
 }
 const doc=new Target();doc.body=new Element('body');doc.head=new Element('head');doc.hidden=false;
 doc.createElement=tag=>new Element(tag);
 doc.getElementById=id=>{const walk=n=>n.id===id?n:n.children.map(walk).find(Boolean);return walk(doc.body)||walk(doc.head)};
 const win=new Target();
 const context=vm.createContext({document:doc,window:win,location:{href:'https://chaturbate.com/test/',origin:'https://chaturbate.com'},innerWidth:1200,innerHeight:900,WeakSet,Object,Math,String,
  setTimeout:fn=>{timers.set(++timer,fn);return timer},clearTimeout:id=>timers.delete(id),
  canonicalWorkshopUrl:()=> 'https://chaturbate.com/?multicam_mode=1',
  showGithubExportNotice:(...args)=>notices.push(args)});
 const dropdown=vm.runInContext(block('  function createWorkshopDropdown()', '  function createNativeRoomQualitySync()')+';createWorkshopDropdown()',context);
 const anchor=new Element('a');doc.body.append(anchor);dropdown.bind(anchor);
 const panel=()=>doc.getElementById('ziggy-workshop-dropdown'),frame=()=>doc.getElementById('ziggy-workshop-frame');
 const message=(data,overrides={})=>win.emit('message',{origin:context.location.origin,source:frame()?.contentWindow,data,...overrides});
 return {doc,win,context,dropdown,anchor,panel,frame,messages,notices,timers,message,open:()=>dropdown.toggle(anchor)};
}
let passed=0;
async function check(name,fn){await fn();console.log('PASS '+name);passed++}
await check('closed/hover idle creates no Workshop browsing context',async()=>{
 const f=fixture();assert(!f.frame());await f.anchor.emit('mouseenter');await f.anchor.emit('pointerenter');assert(!f.frame());
});
await check('click mounts one lazy shared Workshop and never permits top navigation',()=>{
 const f=fixture();f.open();assert.equal(f.frame().src,'https://chaturbate.com/?multicam_mode=1');
 assert.match(f.frame().attrs.sandbox,/allow-scripts/);assert.match(f.frame().attrs.sandbox,/allow-same-origin/);
 assert(!f.frame().attrs.sandbox.includes('allow-top-navigation'));
 assert.equal(f.panel().children[0].children[0].textContent,'Open full Workshop');
});
await check('page scrolling beyond anchor keeps identical editor and clamps it onscreen',async()=>{
 const f=fixture();f.open();const frame=f.frame();f.anchor.rect={left:100,top:-500,bottom:-460};await f.win.emit('scroll');
 assert.equal(f.frame(),frame);assert.equal(f.panel().style.top,'8px');
 f.anchor.rect.bottom=1500;await f.win.emit('scroll');assert.equal(f.panel().style.top,'580px');
});
await check('background/return and settings events retain editor rather than rebuilding it',async()=>{
 const f=fixture();f.open();const frame=f.frame();f.doc.hidden=true;await f.doc.emit('visibilitychange');f.dropdown.sync();
 await f.win.emit('storage',{key:'anything'});f.doc.hidden=false;await f.doc.emit('visibilitychange');assert.equal(f.frame(),frame);
});
await check('inside pointer interactions keep open; outside click requests save acknowledgement',async()=>{
 const f=fixture();f.open();await f.message({type:'ziggy-workshop-ready'});
 await f.doc.emit('pointerdown',{target:f.frame()});assert.equal(f.messages.length,0);
 await f.doc.emit('pointerdown',{target:f.doc.body});assert.equal(f.messages.length,1);assert(f.frame());
 assert.equal(f.messages[0][0].type,'ziggy-workshop-close');
 await f.message({type:'ziggy-workshop-closed',saved:true});assert(!f.panel());assert.equal(f.timers.size,0);
});
await check('untrusted source/origin cannot close or relay a notification',async()=>{
 const f=fixture();f.open();await f.message({type:'ziggy-workshop-ready'});f.dropdown.close();
 await f.message({type:'ziggy-workshop-closed',saved:true},{source:{}});
 await f.message({type:'ziggy-workshop-export-notice',message:'bad'},{origin:'https://other.invalid'});
 assert(f.frame());assert.equal(f.notices.length,0);
 await f.message({type:'ziggy-workshop-closed',saved:true});assert(!f.frame());
});
await check('failed save retains editor and permits retry; old session cannot close new session',async()=>{
 const f=fixture();f.open();await f.message({type:'ziggy-workshop-ready'});const old=f.frame().contentWindow;
 f.dropdown.close();await f.message({type:'ziggy-workshop-closed',saved:false});assert(f.frame());
 f.dropdown.close();assert.equal(f.messages.length,2);await f.message({type:'ziggy-workshop-closed',saved:true});
 f.open();await f.message({type:'ziggy-workshop-closed',saved:true},{source:old});assert(f.frame());
});
await check('loading can be dismissed; repeated opens leave one frame and no timer growth',()=>{
 const f=fixture();for(let i=0;i<10;i++){f.open();assert(f.frame());f.dropdown.close();assert(!f.frame());assert.equal(f.timers.size,0)}
});
await check('header replacement adopts a new anchor without throwing away editor',()=>{
 const f=fixture();f.open();const frame=f.frame();f.anchor.remove();f.dropdown.sync();assert.equal(f.frame(),frame);
 const next=f.doc.createElement('a');f.doc.body.append(next);f.dropdown.bind(next);assert.equal(next.attrs['aria-expanded'],'true');
});
await check('route change and pagehide dispose context; Escape restores anchor focus',async()=>{
 const f=fixture();f.open();await f.message({type:'ziggy-workshop-ready'});await f.doc.emit('keydown',{key:'Escape'});
 await f.message({type:'ziggy-workshop-closed',saved:true});assert(f.anchor.focused);
 f.open();f.context.location.href+='other';f.dropdown.sync();assert(!f.frame());
 f.open();await f.win.emit('pagehide');assert(!f.frame());
});
await check('Expand changes presentation without replacing iframe',async()=>{
 const f=fixture();f.open();const frame=f.frame();await f.panel().children[0].children[1].emit('click');
 assert.equal(f.panel().style.width,'1000px');assert.equal(f.frame(),frame);
});
await check('child reload invalidates old readiness without replacing the frame',async()=>{
 const f=fixture();f.open();const frame=f.frame();frame.contentDocument={};await f.message({type:'ziggy-workshop-ready'});
 frame.contentDocument={};await frame.emit('load');assert.equal(frame.style.visibility,'hidden');
 f.dropdown.close();assert(!f.frame());assert.equal(f.messages.length,0);
});
await check('load after ready in the same document does not hide a working editor',async()=>{
 const f=fixture();f.open();const frame=f.frame();frame.contentDocument={};await f.message({type:'ziggy-workshop-ready'});
 await frame.emit('load');assert.equal(frame.style.visibility,'visible');
});
await check('export feedback stays visible in parent after child closes',async()=>{
 const f=fixture();f.open();await f.message({type:'ziggy-workshop-export-notice',message:'Settings exported.',persistent:false});
 assert.equal(f.notices[0][0],'Settings exported.');
});
await check('embedded export notice is relayed once without a duplicate child toast',()=>{
 const messages=[];let toasts=0;
 const c=vm.createContext({isEmbeddedWorkshop:()=>true,window:{parent:{postMessage:m=>messages.push(m)}},location:{origin:'https://chaturbate.com'},showSuiteToast:()=>toasts++});
 vm.runInContext(block('  function showGithubExportNotice(', '  function queueGithubSettingsAutoExport(')+`;showGithubExportNotice('Exporting settings…',true);`,c);
 assert.equal(toasts,0);assert.equal(messages.length,1);assert.equal(messages[0].persistent,true);
});
await check('GitHub setup actions participate in operation ownership until completion',async()=>{
 const buttons=[{disabled:false}],tracked=[];let done;const work=new Promise(r=>done=r);
 const c=vm.createContext({panel:{querySelectorAll:()=>buttons},trackWorkshopOperation:p=>{tracked.push(p);return p},setStatus(){}});
 const run=vm.runInContext(block('    const withBusy = async', '    const saveButton =')+';withBusy',c);
 const pending=run(buttons[0],()=>work);assert(buttons[0].disabled);assert.equal(tracked[0],work);
 done();await pending;assert.equal(buttons[0].disabled,false);
});
function childFixture({flush=true,pending=[],upload=Promise.resolve()}={}){
 const win=new Target(),messages=[];win.parent={postMessage:m=>messages.push(m)};
 const doc={body:{inert:false}},events=[];
 const context=vm.createContext({embedded:true,window:win,document:doc,location:{origin:'https://chaturbate.com'},
  store:{flush:()=>{events.push('flush');return flush}},pendingOperations:new Set(pending),githubAutoExportQueue:upload,
  suspendWorkshopMedia:()=>events.push('suspend'),resumeDeferredWorkshopRefreshes:()=>events.push('resume'),
  scheduleWorkshopMediaVisibility:()=>events.push('visibility'),workshopPageSuspended:true,Promise,Error,console:{warn(){}}
 });
 vm.runInContext(block('    if (embedded) {\n      let closing', '    void refreshWorkshopRooms({ scope:'),context);
 return {doc,events,messages,context,close:()=>win.emit('message',{origin:context.location.origin,source:win.parent,data:{type:'ziggy-workshop-close'}})};
}
await check('child suspends media then flushes before acknowledging successful close',async()=>{
 const f=childFixture();await f.close();assert.deepEqual(f.events,['suspend','flush','flush']);assert.equal(f.messages.at(-1).saved,true);
});
await check('failed child flush restores usability and never acknowledges a successful save',async()=>{
 const f=childFixture({flush:false});await f.close();assert.equal(f.messages.at(-1).saved,false);assert.equal(f.doc.body.inert,false);
 assert(f.events.includes('resume'));assert.equal(f.context.workshopPageSuspended,false);
});
await check('close waits for already-started explicit operations and coalesced auto export',async()=>{
 let done,uploaded;const pending=new Promise(r=>done=r),upload=new Promise(r=>uploaded=r);
 const f=childFixture({pending:[pending],upload});const result=f.close();await Promise.resolve();
 assert.equal(f.messages.length,1);done();await Promise.resolve();assert.equal(f.messages.length,1);uploaded();await result;
 assert.equal(f.messages.at(-1).saved,true);
});
await check('embedded CSS only changes owned chrome; native preview/fullscreen sizing rules retained',()=>{
 assert(source.includes('body.rg-workshop-embedded > .rg-native-header'));
 assert(source.includes("if (embedded) return;\n      const header"));
 assert(source.includes('.cam-card:not(:fullscreen) > .cam-media:not(:fullscreen)'));
 assert(source.includes('aspect-ratio:16/9!important'));
 assert(source.includes('body.rg-workshop-native .grid::-webkit-scrollbar-thumb'));
 assert(source.includes('body.rg-workshop-embedded .sidebar-group-menu { z-index:2147483001!important;'));
 assert(source.includes('Math.min(e.clientY, innerHeight - rect.height - 8)'));
});
console.log('Workshop editor dropdown: '+passed+' checks passed; controlled boundaries, not live acceptance.');
