import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const file='Chaturbate MultiCam Pro + Cam ARNA.user.js',ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
const source=ref?execFileSync('git',['show',`${ref}:${file}`],{encoding:'utf8',maxBuffer:16e6}):readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const code=source.slice(source.indexOf('    store.subscribe((state, path) => {'),source.indexOf('    // ---- EventBus 订阅 ----'));
function fixture(){
 let update;const counts={};const state={rooms:[],settings:{videoTransforms:{},filter:{}}};
 const c={store:{state,subscribe(fn){update=fn}},document:{},cardMap:new Map(),renderedRoomStatuses:new Map(),filterSel:{},sizeSlider:{},searchInput:{},filterModeFromState:()=>'',ONLINE_GROUP_ID:'online',ONLINE_FAVORITES_GROUP_ID:'fav',currentSavedRoomIndex:()=>new Map()};
 for(const name of ['scheduleSidebarRender','scheduleGridRender','syncSortControl','syncViewSeg','syncLayoutControls','syncShellControls','applyPureModeState','applyVideoTransform','applyAllVideoTransforms','applyMute','syncSplitLayoutState'])c[name]=()=>counts[name]=(counts[name]||0)+1;
 c.service={refreshQuality:()=>counts.quality=(counts.quality||0)+1};vm.runInNewContext(code,c);
 return {counts,state,update:(path)=>update(state,path)};
}
let passed=0;function test(name,run){run();passed++;console.log('PASS '+name)}
test('100 room-transform notifications do no unrelated control/layout work',()=>{const f=fixture();for(let n=0;n<100;n++)f.update('settings:videoTransforms.alpha');assert.equal(f.counts.applyVideoTransform,100);for(const key of ['syncLayoutControls','applyPureModeState','syncShellControls','syncSortControl','syncViewSeg','scheduleGridRender','quality'])assert.equal(f.counts[key]||0,0,key);});
test('volume and quality touch only their intended owners',()=>{const f=fixture();f.update('settings:volume');assert.equal(f.counts.syncLayoutControls||0,0);f.update('settings:maxStreamHeight');assert.equal(f.counts.quality,1);assert.equal(f.counts.scheduleGridRender||0,0);});
test('membership/search/layout and full refresh still update controls',()=>{for(const path of ['settings:activeGroup','settings:searchQuery','settings:layoutSize','all']){const f=fixture();f.update(path);assert.equal(f.counts.scheduleGridRender,1,path);assert.equal(f.counts.syncLayoutControls,1,path);}});
test('split audio/ratio/toolbar settings patch structure without rebuilding grid',()=>{for(const key of ['splitAudioRoomId','splitRatio','splitToolbarPosition']){const f=fixture();f.state.settings.splitViewActive=true;f.update('settings:'+key);assert.equal(f.counts.scheduleGridRender||0,0);assert.equal(f.counts.syncSplitLayoutState,1);}});
console.log(`${passed} settings admission checks passed; counts are synthetic function calls, not browser timings.`);
