const fs=require('fs');
const [kind,action,file]=process.argv.slice(2);
(async()=>{
 const targets=await(await fetch('http://127.0.0.1:9391/json/list')).json();
 const t=targets.find(t=>kind==='agy'?t.type==='iframe'&&/^http:\/\/127\.0\.0\.1:/.test(t.url):kind==='bridge'?t.type==='iframe'&&t.url.includes('extensionId=google.google-antigravity'):t.type==='page'&&t.url.includes('workbench'));
 if(!t)throw Error('Target unavailable');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 let id=0;const contexts=[];const waits=new Map();ws.onmessage=e=>{const x=JSON.parse(e.data);if(x.method==='Runtime.executionContextCreated')contexts.push(x.params.context);if(x.id){const p=waits.get(x.id);if(p){waits.delete(x.id);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result);}}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;waits.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 if(action==='read'){await new Promise(r=>setTimeout(r,750));let contextId;if(kind==='bridge'){await send('Runtime.enable');await new Promise(r=>setTimeout(r,200));for(const c of contexts.filter(c=>c.auxData?.isDefault)){const r=await send('Runtime.evaluate',{expression:'!!document.body?.getAttribute("data-vscode-theme-kind")',contextId:c.id,returnByValue:true});if(r.result?.value)contextId=c.id;}}const r=await send('Runtime.evaluate',{expression:fs.readFileSync(file,'utf8'),contextId,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));const value=r.result.value;if(process.argv[5])fs.writeFileSync(process.argv[5],JSON.stringify(value,null,2));else console.log(JSON.stringify(value,null,2));}
 if(action==='shot'){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
 if(action==='hover'){await send('Page.bringToFront');const r=await send('Runtime.evaluate',{expression:`(()=>{const rows=[...document.querySelectorAll('.quick-input-list .monaco-list-row')].filter(e=>e.getBoundingClientRect().height);const r=rows[1].getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,returnByValue:true});await send('Input.dispatchMouseEvent',{type:'mouseMoved',...r.result.value});}
 if(action==='blur'){await send('Runtime.evaluate',{expression:`document.querySelector('.quick-input-widget input')?.blur()`});}
 if(action==='key'){await send('Page.bringToFront');await send('Runtime.evaluate',{expression:'document.querySelector(".quick-input-widget input")?.focus()'});const key=file,code={ArrowDown:40,ArrowUp:38,Tab:9,Escape:27,Enter:13}[key];await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:code});}
 if(action==='escape'){await send('Page.bringToFront');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});}
 if(action==='token'){
  await send('Page.bringToFront');
  const r=await send('Runtime.evaluate',{expression:`(()=>{const e=[...document.querySelectorAll('.view-lines .view-line span')].find(e=>!e.children.length&&e.textContent.includes('Value')&&e.checkVisibility());if(!e)throw Error('Token not visible');const r=e.getBoundingClientRect();return {x:r.x+5,y:r.y+r.height/2};})()`,returnByValue:true});
  if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
  for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'left',clickCount:1,...r.result.value});
 }
 if(action==='park')await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:600,y:10});
 if(action==='editorfocus'||action==='editorfind'){
  await send('Page.bringToFront');const r=await send('Runtime.evaluate',{expression:`(()=>{const e=[...document.querySelectorAll('.part.editor .view-lines .view-line')].find(e=>e.checkVisibility());if(!e)throw Error('Editor not visible');const r=e.getBoundingClientRect();return{x:r.x+10,y:r.y+r.height/2};})()`,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
  for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'left',clickCount:1,...r.result.value});
  if(action==='editorfind'){
   for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'f',code:'KeyF',windowsVirtualKeyCode:70,modifiers:2});
   let ready=false;for(let i=0;i<10&&!ready;i++){await new Promise(r=>setTimeout(r,100));const q=await send('Runtime.evaluate',{expression:`(()=>{const e=[...document.querySelectorAll('.part.editor .find-widget [aria-label="Find"]')].find(e=>e.checkVisibility());if(!e)return false;e.focus();return true;})()`,returnByValue:true});ready=q.result.value;}if(!ready)throw Error('Editor Find input not visible');
   for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await send('Input.insertText',{text:'contrast'});
  }
 }
 if(action==='explorer'){
  await send('Page.bringToFront');for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'E',code:'KeyE',windowsVirtualKeyCode:69,modifiers:10});
  await send('Runtime.evaluate',{expression:`document.querySelector('.explorer-viewlet .monaco-list')?.focus()`});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:600,y:10});
 }
 if(action==='close')await Promise.race([send('Browser.close'),new Promise(r=>setTimeout(r,1000))]);
 ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
