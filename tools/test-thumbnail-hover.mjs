import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const file='Chaturbate MultiCam Pro + Cam ARNA.user.js',ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
const source=ref?execFileSync('git',['show',`${ref}:${file}`],{encoding:'utf8',maxBuffer:16e6}):readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const code=source.slice(source.indexOf('    function moveimg(){'),source.indexOf('    function refresher(){'));
function fixture(){
 const timers=new Map();let id=0;
 class Image {constructor(){this.listeners=new Map();this.src='';}addEventListener(t,f){this.listeners.set(t,f);}removeEventListener(t,f){if(this.listeners.get(t)===f)this.listeners.delete(t);}removeAttribute(){this.src='';}}
 const c=vm.createContext({Image,Date,document:{hidden:false,location:{href:'https://chaturbate.com/'}},localStorage:{getItem:()=>null},hoverImageJob:null,thisfap:'',fapbr:'',lt2:0,cimg:new Image(),setTimeout(f){timers.set(++id,f);return id},clearTimeout(i){timers.delete(i)}});
 vm.runInContext(code,c);
 function anchor(){const img={src:'https://jpeg.live.mmcdn.com/stream/test.jpg'};return {isConnected:true,img,getElementsByClassName:()=>[],getElementsByTagName(){return [this.img]}};}
 return {c,timers,anchor,load(){const fn=c.cimg.listeners.get('load');fn?.();return fn},tick(){for(const [i,f]of [...timers]){timers.delete(i);f();}}};
}
let passed=0;function test(name,run){run();passed++;console.log('PASS '+name);}
test('mouseleave clears the delayed request and owned listeners',()=>{const f=fixture(),a=f.anchor();f.c.moveimg.call(a);f.load();assert.equal(f.timers.size,1);f.c.moveimgstop();assert.equal(f.timers.size,0);assert.equal(f.c.cimg.listeners.size,0);assert.equal(f.c.hoverImageJob,null);});
test('late previous load cannot paint a newly hovered card',()=>{const f=fixture(),a=f.anchor(),b=f.anchor();f.c.moveimg.call(a);const late=f.load();f.c.moveimg.call(b);const before=b.img.src;late();assert.equal(b.img.src,before);assert.equal(f.timers.size,0);});
for(const boundary of ['hidden','route','detached','replacement','source'])test(boundary+' invalidates an in-flight result',()=>{const f=fixture(),a=f.anchor();f.c.moveimg.call(a);if(boundary==='hidden')f.c.document.hidden=true;if(boundary==='route')f.c.document.location.href+='women/';if(boundary==='detached')a.isConnected=false;if(boundary==='replacement')a.img={src:'new'};if(boundary==='source')a.img.src='https://jpeg.live.mmcdn.com/stream/other.jpg';const before=a.img.src;f.load();assert.equal(a.img.src,before);assert.equal(f.timers.size,0);assert.equal(f.c.hoverImageJob,null);});
test('same image reused for another model cancels delayed admission',()=>{const f=fixture(),a=f.anchor();f.c.moveimg.call(a);f.load();a.img.src='https://jpeg.live.mmcdn.com/stream/other.jpg';f.tick();assert.equal(f.c.hoverImageJob,null);assert.equal(f.timers.size,0);});
test('delayed request rechecks route before admission',()=>{const f=fixture(),a=f.anchor();f.c.moveimg.call(a);f.load();f.c.document.location.href+='women/';f.tick();assert.equal(f.c.hoverImageJob,null);assert.equal(f.timers.size,0);});
console.log(`${passed} hover lifetime checks passed; image transport cancellation is browser-dependent.`);
