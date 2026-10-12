import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
const file = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const ref = process.argv.find(a => a.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:${file}`], { encoding:'utf8', maxBuffer:16e6 }) : readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
function block(a,b){const x=source.indexOf(a),y=source.indexOf(b,x+a.length);assert(x>=0&&y>x);return source.slice(x,y);}
function fixture(count=100){
  const timers=new Map(),calls=[],hold={style:{display:'none'}},counts={scans:0,reads:0};let next=0;
  const cards=Array.from({length:count},()=>({isConnected:true,matches:s=>s==='[data-testid="room-card"]',closest(){return this},querySelectorAll:()=>[]}));
  const work={pending:new Set(),timer:0,route:'',preferences:null,states:new WeakMap(),bound:new WeakSet(),list:null};
  const values=new Map();const context=vm.createContext({thumbnailWork:work, document:{location:{href:'https://chaturbate.com/'},hidden:false,
    getElementById:()=>hold,querySelectorAll:()=>{counts.scans++;return cards},querySelector:()=>null},
    localStorage:{getItem:key=>{counts.reads++;return values.get(key)||null}}, usernoteslist:{usernames:[]}, banusers:[],currpage:'https://chaturbate.com/',roomname:'',
    hoverImageJob:null,Set,WeakMap,WeakSet,performance:{now:()=>0},thumbobserver1:{disconnect(){},observe(){}},
    setTimeout(fn,ms){timers.set(++next,{fn,ms});return next},clearTimeout(id){timers.delete(id)},
    hidemtenter(){},notepopclose(){},showhidden(){},startthumbobserver(){},moveimgstop(){},
  });
  vm.runInContext(block('    function addevent2(', '    function addevent2a('),context);
  context.addevent2a=(batch,preferences)=>calls.push({batch:batch||cards,preferences});
  function tick(){const [id,job]=timers.entries().next().value||[];if(!job)return false;timers.delete(id);job.fn();return true;}
  return {context,cards,work,calls,counts,values,hold,timers,tick,drain(){let n=0;while(tick()){assert(++n<1000)}}};
}
let passed=0;function test(name,run){run();passed++;console.log('PASS '+name)}
test('one appended card never blocks the page or scans retained cards',()=>{
  const f=fixture();f.context.addevent2([{type:'childList',target:{closest:()=>null},addedNodes:[f.cards[0]],removedNodes:[]}]);
  assert.equal(f.hold.style.display,'none');f.drain();assert.equal(f.counts.scans,0);assert.equal(f.calls.flatMap(c=>c.batch).length,1);
});
test('large initial passes yield bounded batches and snapshot preferences once',()=>{
  const f=fixture(1000);f.context.addevent2();assert.equal(f.counts.scans,1);assert.equal(f.calls.length,0);
  assert([...f.timers.values()].every(t=>t.ms<500));f.tick();assert(f.calls[0].batch.length<=32);assert(f.timers.size>0);
  f.drain();assert.equal(f.calls.flatMap(c=>c.batch).length,1000);assert.equal(f.counts.scans,1);assert.equal(f.counts.reads,2);
});
test('deduplicates dirty cards and ignores script-owned note mutations',()=>{
  const f=fixture();const card=f.cards[0];f.context.addevent2([{type:'characterData',target:{parentElement:card},addedNodes:[]}]);
  f.context.addevent2([{type:'attributes',target:card,addedNodes:[]}]);
  f.context.addevent2([{type:'childList',target:card,addedNodes:[{nodeType:1,dataset:{ziggyNote:'1'},closest:()=>card,querySelectorAll:()=>[]}]}]);
  f.drain();assert.equal(f.calls.flatMap(c=>c.batch).length,1);
});
test('route invalidation and disconnected cards discard obsolete work',()=>{
  const f=fixture();f.context.addevent2();f.context.document.location.href='https://chaturbate.com/women/';f.drain();assert.equal(f.calls.length,0);
  f.context.addevent2();f.cards.forEach(c=>c.isConnected=false);f.drain();assert.equal(f.calls.flatMap(c=>c.batch).length,0);
});
test('explicit cancellation removes pending owned timers and references',()=>{
  const f=fixture();f.context.addevent2();f.context.cancelThumbnailDecoration();assert.equal(f.timers.size,0);assert.equal(f.work.pending.size,0);
});
test('container append never scans retained descendants',()=>{
 const f=fixture(1000);let rootScans=0;
 f.context.addevent2([{type:'childList',target:{closest:()=>null,querySelectorAll:()=>{rootScans++;return f.cards}},addedNodes:[f.cards[0]]}]);
 f.drain();assert.equal(rootScans,0);assert.equal(f.calls.flatMap(c=>c.batch).length,1);
});
test('explicit full refresh supersedes pending preference snapshot',()=>{
 const f=fixture();f.context.addevent2();f.values.set('hidemt','1');f.context.addevent2();f.drain();assert(f.calls.every(c=>c.preferences.hideMT));
});
console.log(`Desktop thumbnail queue: ${passed} extracted-source checks passed; no live interaction claim.`);
