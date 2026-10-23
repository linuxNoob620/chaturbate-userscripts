import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js',import.meta.url),'utf8');
const domain='https://chaturbate.com/',room='jully_love';let checks=0;
function block(a,b){const x=source.indexOf(a),y=source.indexOf(b,x+a.length);assert.ok(x>0&&y>x);return source.slice(x,y);}
function roomUrl(value){const u=new URL(value);assert.equal(u.origin,domain.slice(0,-1));assert.equal(u.pathname,'/'+room+'/');assert.equal(u.searchParams.get('tab'),'bio');assert.equal(u.searchParams.has('model'),false);checks++;}
for(const pageType of ['profile','ppage']){
 const header={innerHTML:''},link={addEventListener(){}};
 const context={login:true,pageType,domain,roomname:room,username:'ziggy0010',document:{querySelector(){return header;},getElementById(){return link;},getElementsByTagName(){return [];}},makevidcontrol(){},cleaninit(){},linkfix(){},info(){},buildnotepop(){}};
 vm.runInNewContext(block('    function afterrebuild(){','    function unfollowoption(){')+'\nafterrebuild();',context);roomUrl(header.innerHTML.match(/href='([^']+)'/)[1]);
}
{const expression=source.match(/var bio=(.+);/)[1];roomUrl(vm.runInNewContext(expression,{domain,username:'ziggy0010',thumbroomname:room}));}
for(const sameTab of [true,false]){
 let click,opened;const line=source.split('\n').find(l=>l.includes('getElementById("notepopName").addEventListener("click"'));
 vm.runInNewContext(line,{domain,username:'ziggy0010',openthumbname:room,document:{getElementById(){return{addEventListener(_n,f){click=f;}};}},localStorage:{getItem(){return sameTab?'1':null;}},window:{open(url,target){opened={url,target};}}});click();roomUrl(opened.url);assert.equal(opened.target,sameTab?'_self':'_blank');
}
{const line=source.split('\n').find(l=>l.includes('userstring=userstring+')&&l.includes('target=_blank')&&l.includes('user[1]')&&l.includes('?tab=bio'));
 assert.ok(line);const context={userstring:'',domain,username:'ziggy0010',bc:'',user:[room,'#abc','safe.png','']};vm.runInNewContext(line,context);roomUrl(context.userstring.match(/href='([^']+)'/)[1]);}
for(const status of [200,403,404]){
 let profiles=0,requested;const location={href:domain+room+'/'};
 const context={domain,username:'ziggy0010',roomname:room,noaccess:false,data:'',document:{location,createElement(){throw Error('Fallback must not build an undefined profile image');}},fetch(url,options){requested={url,options};return Promise.resolve({status});},setprofile(){profiles++;context.makecrd();}};
 vm.runInNewContext(block('    function makecrd(){','    function makeimg(){')+block('    function bannedroom(){','    function setprofile(){')+'\nbannedroom();',context);await Promise.resolve();await Promise.resolve();
 assert.equal(location.href,domain+room+'/','Restricted-room fallback must not navigate or self-reload');assert.equal(profiles,1);assert.equal(context.noaccess,true,'Unavailable-room renderer must not assume a loaded profile payload');assert.equal(requested.options.method,'HEAD');checks++;
}
assert.equal(/domain\s*\+\s*["']p\/["']\s*\+\s*username\s*\+\s*["'][^\n]*tab=bio&model=/.test(source),false,'No generated model destination may use the viewer profile route');
console.log(`Room Bio navigation: ${checks} extracted-source checks passed (headings, thumbnail names, notes, user links and nonredirecting restricted fallback).`);
