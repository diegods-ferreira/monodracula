const fs=require('fs'),session=require('./session.json');const[kind,action,file,dest]=process.argv.slice(2);
(async()=>{const targets=await(await fetch('http://127.0.0.1:'+session.port+'/json/list')).json(),target=targets.find(t=>kind==='claude'?t.type==='iframe'&&/extensionId=Anthropic\.claude-code/i.test(t.url):t.type==='page'&&t.url.includes('workbench'));if(!target)throw Error('Target unavailable');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});let id=0;const pending=new Map(),contexts=[];ws.onmessage=e=>{const x=JSON.parse(e.data);if(x.method==='Runtime.executionContextCreated')contexts.push(x.params.context);if(x.id){const p=pending.get(x.id);if(p){pending.delete(x.id);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result);}}};const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
let contextId;if(kind==='claude'){await send('Runtime.enable');await new Promise(r=>setTimeout(r,150));for(const c of contexts.filter(c=>c.auxData?.isDefault)){const r=await send('Runtime.evaluate',{expression:'!!document.getElementById("root")',contextId:c.id,returnByValue:true});if(r.result?.value)contextId=c.id;}if(!contextId)throw Error('Claude app execution context unavailable');}
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,contextId,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
if(action==='read'){await new Promise(r=>setTimeout(r,350));const value=await evaluate(fs.readFileSync(file,'utf8'));if(dest)fs.writeFileSync(dest,JSON.stringify(value,null,2));else console.log(JSON.stringify(value,null,2));}
if(action==='shot'){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
if(action==='focus'||action==='draft'){await evaluate(`(()=>{const e=[...document.querySelectorAll('[role="textbox"][contenteditable],[contenteditable="true"],textarea')].find(e=>e.checkVisibility()&&!e.disabled);if(!e)throw Error('Editable prompt unavailable');e.focus();})()`);if(action==='draft')await send('Input.insertText',{text:'Local contrast draft (not sent).'});}
if(action==='blur')await evaluate('document.activeElement.blur()');
if(action==='code'||action==='hoverCopy'){
 const index=Number(file)||0,rect=await evaluate(`(()=>{const e=[...document.querySelectorAll('div[class*="codeBlockWrapper_"]')][${index}];if(!e)throw Error('Code block unavailable');e.scrollIntoView({block:'center'});const t=${action==='hoverCopy'?'e.querySelector("button")':'e'};const r=t.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(action==='hoverCopy')await send('Input.dispatchMouseEvent',{type:'mouseMoved',...rect});
}
if(action==='empty'){await evaluate(`(()=>{const e=[...document.querySelectorAll('[role="textbox"][contenteditable],[contenteditable="true"],textarea')].find(e=>e.checkVisibility()&&!e.disabled);if(!e)throw Error('Editable prompt unavailable');e.focus();const r=document.createRange();r.selectNodeContents(e);const s=getSelection();s.removeAllRanges();s.addRange(r);})()`);for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});}
if(action==='park')await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
if(action==='escape')for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
if(action==='clickMode'){
 const rect=await evaluate(`(()=>{const selector=${JSON.stringify(file)},e=selector.startsWith('mode:')?[...document.querySelectorAll('button[class*=menuItemV2_]')].find(e=>e.checkVisibility()&&e.textContent.startsWith(selector.slice(5))):[...document.querySelectorAll(selector)].find(e=>e.checkVisibility());if(!e||e.matches('[aria-label="Send message"]'))throw Error('Unsafe or missing mode control '+selector);const text=e.textContent.trim();if(!/^(Manual|Plan|Auto|Ask before edits|Plan mode|Auto mode|Accept edits)/i.test(text))throw Error('Unexpected mode control '+text);const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...rect,button:'left',clickCount:1});
}
if(action==='hover'||action==='focusElement'){
 const selector=file;const rect=await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.checkVisibility());if(!e)throw Error('Element not visible');const r=e.getBoundingClientRect();${action==='focusElement'?'e.focus();':''}return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 if(action==='hover')await send('Input.dispatchMouseEvent',{type:'mouseMoved',...rect});
}
if(action==='layout'){
 if(kind!=='workbench'||!['View: Join All Editor Groups','View: Toggle Secondary Side Bar Visibility','View: Toggle Primary Side Bar Visibility','Inline Chat: Start Inline Chat'].includes(file))throw Error('Unsupported temporary layout command');
 for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'F1',code:'F1',windowsVirtualKeyCode:112});
 await new Promise(r=>setTimeout(r,400));await send('Input.insertText',{text:file});await new Promise(r=>setTimeout(r,600));
 for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await new Promise(r=>setTimeout(r,500));
}
if(action==='inlineStart'){
 if(kind!=='workbench')throw Error('Native editor only');await evaluate("(()=>{const e=[...document.querySelectorAll('.monaco-editor textarea')].find(e=>e.checkVisibility());if(!e)throw Error('Editor input unavailable');e.focus()})()");
 for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'i',code:'KeyI',windowsVirtualKeyCode:73,modifiers:2});
 await new Promise(r=>setTimeout(r,700));
}
if(action==='fixtureTab'){
 if(kind!=='workbench'||!['example.ts','Local visual contrast'].includes(file))throw Error('Fixture tabs only');const rect=await evaluate(`(()=>{const e=[...document.querySelectorAll('.tab')].find(e=>e.textContent.includes(${JSON.stringify(file)}));if(!e)throw Error('Fixture tab unavailable');const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...rect,button:'left',clickCount:1});await new Promise(r=>setTimeout(r,500));
}
if(action==='clearMenus'){
 const rect=await evaluate(`(()=>{const e=document.querySelector('[role="textbox"][contenteditable]');if(!e)throw Error('Prompt unavailable');const r=e.getBoundingClientRect();return{x:r.x+12,y:r.y+r.height/2}})()`);
 for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...rect,button:'left',clickCount:1});
 await evaluate('document.activeElement.blur()');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
}
if(action==='unlockGroup'){
 if(kind!=='workbench')throw Error('Workbench only');const r=await evaluate(`(()=>{const e=[...document.querySelectorAll('[aria-label="Unlock Group"]')].find(e=>e.checkVisibility());if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);if(r)for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...r,button:'left',clickCount:1});
}
if(action==='keyboardFocus'){
 const proof=await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(file)})].find(e=>e.checkVisibility());if(!e)throw Error('Target unavailable');const all=[...document.querySelectorAll('button,a,input,textarea,select,[tabindex],[contenteditable]')].filter(x=>x.checkVisibility()&&x.tabIndex>=0&&!x.disabled&&x.getAttribute('aria-disabled')!=='true');const i=all.indexOf(e);if(i<0)throw Error('Target is not a tab stop');let start=all[i-1],reverse=false;if(e.closest('.monaco-dialog-box')){start=all[i+1];reverse=true;}else if(!start||start.isContentEditable||start.tagName==='TEXTAREA'||start.closest('.monaco-editor')){start=all[i+1];reverse=true;}if(!start)throw Error('No safe adjacent tab stop');start.focus();return{direction:reverse?'Shift+Tab':'Tab',start:{tag:start.tagName,classes:start.className},target:{tag:e.tagName,classes:e.className}}})()`);
 for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:proof.direction==='Tab'?0:8});
 proof.result=await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(file)})].find(e=>e.checkVisibility());return{focused:e?.matches(':focus'),focusVisible:e?.matches(':focus-visible'),activeTag:document.activeElement.tagName,activeClasses:document.activeElement.className}})()`);if(dest)fs.writeFileSync(dest,JSON.stringify(proof,null,2));if(!proof.result.focused)throw Error('Real keyboard navigation did not reach target: '+JSON.stringify(proof));
}
if(action==='close')await Promise.race([send('Browser.close'),new Promise(r=>setTimeout(r,1000))]);ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
