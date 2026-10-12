// Isolated real Chromium DOM/MutationObserver fixtures, NOT installed-site acceptance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js',import.meta.url),'utf8');
function block(a,b){const x=source.indexOf(a),y=source.indexOf(b,x+a.length);assert(x>=0&&y>x);return source.slice(x,y);}
const base='http://127.0.0.1:9223';
const previous=(await(await fetch(base+'/json/list')).json()).find(t=>t.type==='page'&&t.url.startsWith('https://chaturbate.com/'));
const target=await(await fetch(base+'/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl),pending=new Map();let seq=0;
ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);};
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
try{
 await call('Page.bringToFront');
 const result=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
 const nativeDocument=window.document,checks=[];
 const check=(value,label)=>{if(!value)throw Error(label);checks.push(label);};
 const location={href:'https://chaturbate.com/followed-cams/'};
 const document={location,hidden:false,getElementById:n=>nativeDocument.getElementById(n),querySelector:s=>nativeDocument.querySelector(s),querySelectorAll:s=>nativeDocument.querySelectorAll(s),createElement:t=>nativeDocument.createElement(t)};
 const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null};
 let scans=0,notesOpened=[],fullHidden=0,callbackCount=0;
 const originalQuery=document.querySelectorAll;document.querySelectorAll=s=>{scans++;return originalQuery(s);};
 const thumbnailWork={pending:new Set(),timer:0,route:'',preferences:null,states:new WeakMap(),bound:new WeakMap()};
 const thumbobserver1=new MutationObserver(records=>{callbackCount++;addevent2(records);});
 let currpage=location.href,roomname='followed-cams',hoverImageJob=null;
 const supporter=false,login=true,username='fixture',domain='https://example.invalid/';
 const note='<span>note</span>',nonote='<span>empty</span>',usernoteslist={usernames:['beta']},hiddenarray=['alpha','beta'];
 function hidemtenter(){} function notepopclose(){} function moveimg(){} function moveimgstop(){}
 function shownote(name){notesOpened.push(name);} function openInNewTab(){}
 function showhidden(){fullHidden++;showhidden3();}
 ${block('    function addevent2(', '    function openInNewTab(')}
 ${block('    function startthumbobserver(', '    function showhidden(){')}
 ${block('    function showhidden3(', '    function shownote(')}
 nativeDocument.body.innerHTML='<div id="holdpage" style="display:none"></div><div data-testid="room-list-container"><div data-testid="room-list"></div></div>';
 const list=document.querySelector('[data-testid="room-list"]');
 function card(name){const node=nativeDocument.createElement('article');node.dataset.testid='room-card';node.innerHTML='<a data-testid="room-card-image-anchor"><img></a><div class="RoomCardDetails"><a data-testid="room-card-username"></a><span data-testid="room-card-gender" class="genderf"></span><span data-testid="thumbnail-label">LIVE</span></div>';node.querySelector('[data-testid="room-card-username"]').textContent=name;return node;}
 for(let i=0;i<100;i++)list.append(card(i?'fixture_'+i:'alpha'));
 addevent2();const added=card('beta');list.append(added);
 const hydrating=card('');list.append(hydrating);await new Promise(r=>setTimeout(r,30));hydrating.querySelector('[data-testid="room-card-username"]').textContent='late_model';
 await new Promise(r=>setTimeout(r,200));
 check(document.querySelectorAll('[title="User notes"]').length===102&&hydrating.querySelector('[title="User notes"]').name==='late_model','yielded initial additions and later native hydration are decorated');
 check(document.getElementById('holdpage').style.display==='none','automatic decoration never blocks');
 check(fullHidden===1&&callbackCount<10,'real observer self-mutations settle without hidden-list re-fetch');
 const beforeScans=scans,beforeCallbacks=callbackCount;
 const fresh=card('beta');list.append(fresh);await new Promise(r=>setTimeout(r,100));
 check(scans===beforeScans,'single append does not scan whole document');
 check(fullHidden===1&&callbackCount-beforeCallbacks<5,'targeted append does not refetch hidden list or loop');
 check(fresh.querySelector('[data-testid="thumbnail-label"]').textContent==='LIVE HIDDEN','new hidden cards use current hidden status');
 const noteNode=fresh.querySelector('[title="User notes"]'),link=fresh.querySelector('[data-testid="room-card-username"]');
 link.textContent='gamma';await new Promise(r=>setTimeout(r,100));
 check(fresh.querySelector('[title="User notes"]')===noteNode&&noteNode.name==='gamma'&&noteNode.textContent==='empty','recycled card reuses note and updates model/icon');
 check(link.href.endsWith('model=gamma')&&fresh.querySelector('[data-testid="thumbnail-label"]').textContent==='LIVE','recycled bio link/hidden badge updated');
 noteNode.click();check(notesOpened.join(',')==='gamma','note handler reads current model');
 location.href='https://chaturbate.com/women/';storage.set('hidemt','1');fresh.querySelector('[data-testid="room-card-gender"]').className='genderm';addevent2();await new Promise(r=>setTimeout(r,100));
 check(fresh.style.display==='none','gender filtering still applies');storage.delete('hidemt');addevent2();await new Promise(r=>setTimeout(r,100));check(fresh.style.display==='','turning filter off restores only owned display');
 cancelThumbnailDecoration();thumbobserver1.disconnect();
 const grid=nativeDocument.createElement('div');nativeDocument.body.append(grid);
 const ids=['one','two'],roots=ids.map(()=>nativeDocument.createElement('article')),panes=ids.map(()=>nativeDocument.createElement('div'));
 roots.forEach((root,i)=>{root.append(nativeDocument.createElement('video'));panes[i].append(root);grid.append(panes[i]);});
 const toolbar=nativeDocument.createElement('div'),positionBtn=nativeDocument.createElement('button');toolbar.dataset.position='top';toolbar.append(positionBtn);grid.append(toolbar);
 const controls=ids.map(()=>{const audioBtn=nativeDocument.createElement('button');panes[0].append(audioBtn);return{prevOnlineBtn:nativeDocument.createElement('button'),nextOnlineBtn:nativeDocument.createElement('button'),audioBtn,audioActive:null};});
 let splitLayoutView={ids,roots,panes,toolbar,positionBtn,controls};
 const store={state:{settings:{splitViewActive:true,splitRoomIds:ids,splitRatio:50,splitToolbarPosition:'top',splitAudioRoomId:'one'}}};
 const cardMap=new Map(ids.map((id,i)=>[id,{root:roots[i]}])),findRoomAny=id=>({id});
 function reconcileSplitState(){} function splitOnlineCycleIds(){return ids;}function t(s){return s;}function clampInt(n,lo,hi,fallback){return Math.max(lo,Math.min(hi,n??fallback));}
 function splitToolbarPositionLabel(s){return s;}function applyMute(){}function setTrustedHtml(n,s){n.innerHTML=s;}function trustedHtml(s){return s;}function iconSvg(s){return s;}
 function requestRoomMediaIfNeeded(){}function renderCardState(){}function syncSplitButton(){}function allRoomsForView(){throw Error('structural rebuild requested');}
 ${block('    function syncSplitLayoutState()', '    function renderGrid()')}
 const structural=new MutationObserver(()=>{});structural.observe(grid,{childList:true});const videos=roots.map(n=>n.querySelector('video'));controls[0].audioBtn.focus();
 for(let i=0;i<100;i++){store.state.settings.splitRatio=20+i%60;store.state.settings.splitAudioRoomId=ids[i%2];store.state.settings.splitToolbarPosition=i%2?'bottom':'top';renderSplitLayout();}
 check(structural.takeRecords().length===0&&roots.every((n,i)=>panes[i].contains(n)&&n.querySelector('video')===videos[i]),'100 split updates preserve panes, cards and video nodes without grid mutations');
 check(nativeDocument.activeElement===controls[0].audioBtn,'split updates preserve focused control');
 panes[0].remove();let rebuilt=false;try{renderSplitLayout();}catch(error){rebuilt=error.message==='structural rebuild requested';}check(rebuilt,'partially detached split must reconcile structurally');structural.disconnect();grid.remove();
 return {checks,observerCallbacks:callbackCount,fullHiddenRefreshes:fullHidden,wholeDocumentScans:scans,accountRequests:0};
})()`});
 if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
 console.log(JSON.stringify(result.result.value,null,2));
}finally{await fetch(base+'/json/close/'+target.id);if(previous)await fetch(base+'/json/activate/'+previous.id);ws.close();}
