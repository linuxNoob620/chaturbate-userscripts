import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js',import.meta.url),'utf8');
const start=source.indexOf('    function iagree(){'),end=source.indexOf('    function setgenstyle(){',start);
assert.ok(start>0&&end>start);
const code=source.slice(start,end);let checks=0;
for(const hasInput of [true,false])for(const rules of [false,true])for(const dismiss of [false,true]){
 let mouse=0,focus=0,rulesClicks=0,dismissClicks=0;
 const input={dispatchEvent(){mouse++;focus++;},focus(){focus++;}};
 const document={getElementsByClassName(name){if(name==='inputDiv')return hasInput?[input]:[];if(name==='acceptRulesButton')return rules?[{click(){rulesClicks++;}}]:[];return [];},
  querySelector(selector){assert.equal(selector,'[data-testid="dismissible-message-dismiss"]');return dismiss?{click(){dismissClicks++;}}:null;}};
 const ctx={document,Event:class{}};vm.createContext(ctx);vm.runInContext(code+'\niagree();',ctx);
 assert.equal(mouse,0,'Room startup must not simulate a mouse press on chat');assert.equal(focus,0,'Room startup must not focus the chat editor');
 assert.equal(rulesClicks,rules?1:0,'Existing available rule acknowledgement is retained');assert.equal(dismissClicks,dismiss?1:0,'Existing dismissible-message behavior is retained');checks++;
}
assert.equal(source.includes('function triggerMouseEvent ('),false,'Unreferenced focus-trigger helper is removed');
console.log(`Chat startup focus: ${checks} extracted-source checks passed; no automatic editor focus, existing acknowledgements retained.`);
