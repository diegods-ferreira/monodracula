// Local-only Chromium DevTools connection to our isolated VS Code hosts.
const fs=require('fs');
const [port,action,...args]=process.argv.slice(2);
(async()=>{
 const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 if(action==='targets'){console.log(JSON.stringify(targets.map(t=>({type:t.type,title:t.title,url:t.url})),null,2));return;}
 const target=targets.find(t=>t.type==='page'&&(process.env.THEME_VISUAL_TARGET?t.url.includes(process.env.THEME_VISUAL_TARGET):t.url.includes('workbench')));
 if(!target)throw Error('No workbench target: '+JSON.stringify(targets.map(t=>({type:t.type,url:t.url}))));
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const {r,j}=pending.get(m.id);pending.delete(m.id);m.error?j(Error(JSON.stringify(m.error))):r(m.result);}};
 const send=(method,params={})=>new Promise((r,j)=>{const id=++seq;pending.set(id,{r,j});ws.send(JSON.stringify({id,method,params}));});
 const evalJS=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 if(action==='close')await Promise.race([send('Browser.close'),new Promise(r=>setTimeout(r,1000))]);
 if(action==='snapshot'){await send('Page.bringToFront');await new Promise(r=>setTimeout(r,500));const value=await evalJS(fs.readFileSync(__dirname+'/renderer-snapshot.js','utf8'));fs.writeFileSync(args[0],JSON.stringify(value,null,2));console.log(args[0]);}
 if(action==='eval')console.log(JSON.stringify(await evalJS(args[0]),null,2));
 if(action==='command'){
  await send('Page.bringToFront');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'F1',code:'F1',windowsVirtualKeyCode:112});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'F1',code:'F1',windowsVirtualKeyCode:112});
  await new Promise(r=>setTimeout(r,700));await evalJS(`(()=>{const e=[...document.querySelectorAll('.quick-input-widget input')].find(e=>e.getBoundingClientRect().width);if(!e)throw Error('No palette input');e.focus();e.value=${JSON.stringify('>'+args[0])};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await new Promise(r=>setTimeout(r,800));
  const palette=await evalJS('[...document.querySelectorAll(".quick-input-list .label-name")].map(e=>e.textContent).join("\\n")');
  if(!palette?.includes(args[0]))throw Error('Requested command not confirmed in palette: '+palette);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 }
 if(action==='shot'){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(args[0],Buffer.from(r.data,'base64'));console.log(args[0]);}
 if(action==='button'){
  const point=await evalJS(`(()=>{const e=[...document.querySelectorAll('.monaco-dialog-box .monaco-button.secondary')].find(e=>e.textContent.includes('Secondary action'));if(!e)throw Error('Secondary fixture button absent');if(${JSON.stringify(args[0])}==='focus')e.focus();const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:args[0]==='hover'?point.x:1,y:args[0]==='hover'?point.y:1});
 }
 if(action==='tabsecondary'){
  await evalJS(`document.querySelector('.monaco-dialog-box .monaco-button:not(.secondary)').focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 }
 if(action==='dismiss'){
  const p=await evalJS(`(()=>{const e=[...document.querySelectorAll('.monaco-dialog-box .monaco-button')].find(e=>e.textContent==='Cancel');if(!e)throw Error('Cancel absent');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
 }
 if(action==='token'){
  const p=await evalJS(`(()=>{const e=[...document.querySelectorAll('.view-lines .view-line span')].find(e=>!e.children.length&&e.textContent===${JSON.stringify(args[0])}&&e.getBoundingClientRect().width);if(!e)throw Error('Token absent');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
 }
 if(action==='key'){await send('Input.dispatchKeyEvent',{type:'keyDown',key:args[0],code:args[0]});await send('Input.dispatchKeyEvent',{type:'keyUp',key:args[0],code:args[0]});}
 ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
