const fs=require('fs'),p=__dirname+'/cdp.cjs';let code=fs.readFileSync(p,'utf8');if(code.includes("action==='chatFocus'"))throw Error('Already extended');code=code.replace("if(action==='close')",`if(['chatFocus','chatDraft','chatEmpty'].includes(action)){
 if(kind!=='workbench')throw Error('Native workbench only');await evaluate('(()=>{const e=[...document.querySelectorAll(".chat-input-container .native-edit-context")].find(e=>e.checkVisibility());if(!e)throw Error("Native chat editor unavailable");e.focus()})()');
 if(action==='chatEmpty'){
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
 }
 if(action==='chatDraft')await send('Input.insertText',{text:'Local native composer draft (not sent).'});
}
if(action==='close')`);fs.writeFileSync(p,code);
