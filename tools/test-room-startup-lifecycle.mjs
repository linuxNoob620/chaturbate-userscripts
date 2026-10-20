import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js',import.meta.url),'utf8');
const state=source.slice(source.indexOf('    let desktopVideoFitTimer ='),source.indexOf('    let mobilePrivateTab ='));
const code=source.slice(source.indexOf('    function applyDesktopVideoFit()'),source.indexOf('    function mobileTabText('));
const visibilityStart=source.indexOf("    document.addEventListener('visibilitychange', () => {\n      if (nativeMobilePage) return;\n      if (document.hidden)");
const visibility=source.slice(visibilityStart,source.indexOf('    // A mobile page restored',visibilityStart));
assert.ok(state&&code);
function fixture({hidden=false,ready=4}={}){
 let now=100000,id=0;const timers=new Map(),frames=new Map(),events=[],scrolls=[],listeners=new Map();
 const rect={left:0,top:100,width:800,height:450,bottom:550};
 const panel={isConnected:true,getBoundingClientRect:()=>rect};
 const nodes={panel,video:{readyState:ready,videoWidth:1920,videoHeight:1080,getBoundingClientRect:()=>rect},
   handle:{getBoundingClientRect:()=>({left:800,top:100,width:8,height:450}),dispatchEvent:e=>events.push(e.type)},
   roomContents:{dispatchEvent:e=>events.push(e.type)},topSection:{getBoundingClientRect:()=>({width:1500})},anchor:{getBoundingClientRect:()=>({bottom:600,height:40})}};
 const document={hidden,fullscreenElement:null,documentElement:{scrollTop:0},removeEventListener(){},addEventListener:(name,fn)=>listeners.set(name,fn)};
 const ctx=vm.createContext({document,currentRoom:'one',nativeMobilePage:false,isWorkstation:false,
  Date:{now:()=>now},window:{innerHeight:800,scrollY:0,scrollX:0,scrollTo:o=>scrolls.push(o)},
  setTimeout:(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
  MouseEvent:class{constructor(type,opts){this.type=type;Object.assign(this,opts);}},desktopVideoFitNodes:()=>nodes,
  syncSuitePageMountsSoon(){},collapsed:true,activeDockTab:'multicam',camArna:{deactivate(){},activate(){}},activeDockRoom:()=>null});
 vm.runInContext(state+code+visibility+`;globalThis.api={applyDesktopVideoFit,applyDesktopInitialRoomPosition,scheduleDesktopInitialRoomPosition,scheduleDesktopVideoFit,cancelDesktopInitialRoomPosition,
 state:()=>({attempts:desktopInitialRoomPositionAttempts,positioned:desktopInitialRoomPositioned,cancelled:desktopInitialRoomPositionCancelled,fitDone:desktopVideoFitCompleted,busy:desktopVideoFitBusy,fitAttempts:desktopVideoFitAttempts}),
 positioned:()=>{desktopInitialRoomPositioned=true;},hide:()=>{document.hidden=true;},show:()=>{document.hidden=false;}};`,ctx);
 return {api:ctx.api,document,nodes,events,scrolls,frames,timers,visibility:()=>listeners.get('visibilitychange')(),
  advance(ms){now+=ms;for(const [id,t]of [...timers])if(t.at<=now){timers.delete(id);t.fn();}},
  frame(){const batch=[...frames];frames.clear();for(const [,fn]of batch)fn();}};
}
let checks=0;function check(name,fn){try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}}
check('hidden position work remains pending without consuming attempts',()=>{const f=fixture({hidden:true});for(let i=0;i<40;i++)f.api.applyDesktopInitialRoomPosition();assert.equal(f.scrolls.length,0);assert.equal(f.api.state().attempts,0);assert.equal(f.api.state().cancelled,false);f.api.show();f.api.applyDesktopInitialRoomPosition();assert.equal(f.scrolls.length,1);});
check('hidden fitting cannot start a native drag or expire the fit',()=>{const f=fixture({hidden:true});f.api.positioned();f.api.applyDesktopVideoFit();f.advance(20000);f.api.applyDesktopVideoFit();assert.deepEqual(f.events,[]);assert.equal(f.api.state().fitDone,false);f.api.show();f.api.applyDesktopVideoFit();f.advance(160);assert.equal(f.events[0],'mousedown');});
check('manual cancellation remains authoritative on first activation',()=>{const f=fixture({hidden:true});f.api.cancelDesktopInitialRoomPosition();f.api.show();f.api.applyDesktopInitialRoomPosition();assert.deepEqual(f.scrolls,[]);});
check('a hidden frame never resumes the obsolete drag movement',()=>{const f=fixture();f.api.positioned();f.api.applyDesktopVideoFit();f.advance(160);assert.equal(f.events[0],'mousedown');f.api.hide();f.frame();assert.ok(!f.events.includes('mousemove'));assert.equal(f.events.at(-1),'mouseup');assert.equal(f.api.state().busy,false);});
check('fullscreen transition cannot resume a pending drag',()=>{const f=fixture();f.api.positioned();f.api.applyDesktopVideoFit();f.advance(160);f.document.fullscreenElement={};f.frame();assert.ok(!f.events.includes('mousemove'));assert.equal(f.events.at(-1),'mouseup');});
check('completed startup does not re-scroll or resize later',()=>{const f=fixture();f.api.applyDesktopInitialRoomPosition();f.api.applyDesktopInitialRoomPosition();assert.equal(f.scrolls.length,1);});
check('rapid hide/show cancels obsolete drag settling before the resumed fit',()=>{const f=fixture();f.api.positioned();f.api.applyDesktopVideoFit();f.advance(160);f.api.hide();f.visibility();f.advance(200);f.api.show();f.visibility();f.advance(20);assert.equal(f.api.state().fitDone,false);f.advance(100);f.advance(160);assert.equal(f.api.state().fitDone,false);assert.ok(f.events.filter(e=>e==='mousedown').length>=2);});
check('completed drag settle is also invalidated by hiding',()=>{const f=fixture();f.api.positioned();f.api.applyDesktopVideoFit();f.advance(160);f.frame();f.frame();f.api.hide();f.visibility();f.advance(200);f.api.show();f.visibility();f.advance(20);assert.equal(f.api.state().fitDone,false);});
console.log(`Desktop room startup: ${checks} extracted-source lifecycle checks passed (not live acceptance).`);
