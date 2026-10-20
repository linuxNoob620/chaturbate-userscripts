import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js',import.meta.url),'utf8');
const start=source.indexOf('  function saveNativeDesktopRoomMode(');
const end=source.indexOf('  // BEGIN GENERATED SETTINGS SYNC',start);
assert.ok(start>0&&end>start,'Native remembered mode writer is present');
const writer=source.slice(start,end);
let checks=0;
function fixture({native='{"isTheaterMode":true,"keep":7}',host='chaturbate.com',ua='desktop',mobile=false,touch=0,coarse=false,readFail=false,writeFail=false}={}){
 const values=new Map([['isTheaterMode',native]]),writes=[];
 const context={location:{hostname:host},navigator:{userAgent:ua,userAgentData:{mobile},maxTouchPoints:touch},window:{matchMedia:()=>({matches:coarse})},
  localStorage:{getItem:k=>{if(readFail)throw Error('read failed');return values.get(k)??null;},setItem:(k,v)=>{if(writeFail)throw Error('write failed');writes.push(k);values.set(k,v);}}};
 vm.createContext(context);vm.runInContext(writer,context);
 return {context,values,writes,save:context.saveNativeDesktopRoomMode};
}
for(const wanted of [false,true]){
 const f=fixture({native:JSON.stringify({isTheaterMode:!wanted,keep:7})});assert.equal(f.save(wanted),true);
 assert.deepEqual(JSON.parse(f.values.get('isTheaterMode')),{isTheaterMode:wanted,keep:7});assert.deepEqual(f.writes,['isTheaterMode']);checks++;
}
{const f=fixture();assert.equal(f.save(true),true);assert.deepEqual(f.writes,[]);checks++;}
{const f=fixture({native:null});assert.equal(f.save(false),true);assert.deepEqual(JSON.parse(f.values.get('isTheaterMode')),{isTheaterMode:false});checks++;}
for(const options of [{native:'{broken'},{native:'null'},{native:'[]'},{readFail:true},{writeFail:true}]){
 const f=fixture(options),before=f.values.get('isTheaterMode');assert.equal(f.save(false),false);assert.equal(f.values.get('isTheaterMode'),before);assert.deepEqual(f.writes,[]);checks++;
}
for(const options of [{host:'recu.me'},{host:'notchaturbate.com'},{ua:'Mozilla Android'},{mobile:true},{touch:5,coarse:true}]){
 const f=fixture(options);assert.equal(f.save(false),true);assert.deepEqual(f.writes,[]);checks++;
}
{const f=fixture();assert.equal(f.save('normal'),false);assert.deepEqual(f.writes,[]);checks++;}
const panelStart=source.indexOf('    function openPlaybackSettingsPanel()');
const panelEnd=source.indexOf('    function openBackupPanel()',panelStart);
assert.ok(panelStart>0&&panelEnd>panelStart);
function panel({flush=true,writeFail=false,selected='normal'}={}){
 const f=fixture({writeFail}),selects=[],closed=[],warnings=[],order=[];let save,refresh=0;
 Object.assign(f.context,{
  $:(tag,props={},children=[])=>{const n={...props,children};if(tag==='select')selects.push(n);if(tag==='button'&&props.class==='ctrl-btn primary')save=props.onclick;return n;},
  openToolPanel:(_title,build)=>build({append(){}},reason=>closed.push(reason)),t:s=>s,LANG:'en',
  store:{state:{settings:{maxStreamHeight:480,nativeRoomStartupHeight:1080,freeZoom:true,defaultTheaterMode:true}},
   patchSettings(p){Object.assign(this.state.settings,p);order.push('patch');},flush(){order.push('flush');return flush;}},
  service:{refreshQuality(){refresh++;}},toast:s=>warnings.push(s),
 });
 const realSave=f.context.saveNativeDesktopRoomMode;f.context.saveNativeDesktopRoomMode=v=>{order.push('native');assert.equal(order.at(-2),'flush');return realSave(v);};
 vm.runInContext(source.slice(panelStart,panelEnd)+'\nopenPlaybackSettingsPanel();',f.context);
 selects[2].value=selected;save();return {...f,closed,warnings,order,refresh};
}
{const f=panel({flush:false});assert.deepEqual(f.order,['patch','flush']);assert.deepEqual(f.writes,[]);assert.deepEqual(f.closed,[]);assert.equal(f.refresh,0);checks++;}
{const f=panel();assert.equal(JSON.parse(f.values.get('isTheaterMode')).isTheaterMode,false);assert.deepEqual(f.closed,['saved']);assert.equal(f.refresh,1);assert.deepEqual(f.warnings,[]);checks++;}
{const f=panel({selected:'theatre'});assert.equal(JSON.parse(f.values.get('isTheaterMode')).isTheaterMode,true);assert.deepEqual(f.closed,['saved']);checks++;}
{const f=panel({writeFail:true});assert.deepEqual(f.closed,[]);assert.equal(f.refresh,0);assert.match(f.warnings[0],/Suite settings saved, but.*remembered room mode/);checks++;}
assert.match(source,/\/\/ @run-at\s+document-end/);
console.log(`Room startup preference: ${checks} checks passed; native mode follows successful explicit Save, failures and mobile exclusions retained.`);
