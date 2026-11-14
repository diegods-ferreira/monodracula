const fs=require('fs');
const [kind,action,file]=process.argv.slice(2);
(async()=>{
 const targets=await(await fetch('http://127.0.0.1:9361/json/list')).json();
 const t=targets.find(t=>kind==='agy'?t.type==='iframe'&&/^http:\/\/127\.0\.0\.1:/.test(t.url):kind==='bridge'?t.type==='iframe'&&t.url.includes('extensionId=google.google-antigravity'):t.type==='page'&&t.url.includes('workbench'));
 if(!t)throw Error('Target unavailable');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 let id=0;const contexts=[];const waits=new Map();ws.onmessage=e=>{const x=JSON.parse(e.data);if(x.method==='Runtime.executionContextCreated')contexts.push(x.params.context);if(x.id){const p=waits.get(x.id);if(p){waits.delete(x.id);x.error?p.reject(Error(JSON.stringify(x.error))):p.resolve(x.result);}}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;waits.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 if(action==='read'){await new Promise(r=>setTimeout(r,750));let contextId;if(kind==='bridge'){await send('Runtime.enable');await new Promise(r=>setTimeout(r,200));for(const c of contexts.filter(c=>c.auxData?.isDefault)){const r=await send('Runtime.evaluate',{expression:'!!document.body?.getAttribute("data-vscode-theme-kind")',contextId:c.id,returnByValue:true});if(r.result?.value)contextId=c.id;}}const r=await send('Runtime.evaluate',{expression:fs.readFileSync(file,'utf8'),contextId,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));const value=r.result.value;if(process.argv[5])fs.writeFileSync(process.argv[5],JSON.stringify(value,null,2));else console.log(JSON.stringify(value,null,2));}
 if(action==='shot'){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
 if(action==='escape'){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});}
 if(action==='close')await Promise.race([send('Browser.close'),new Promise(r=>setTimeout(r,1000))]);
 ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
