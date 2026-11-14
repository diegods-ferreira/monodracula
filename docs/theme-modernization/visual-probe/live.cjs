// Keeps only our isolated Extension Host alive for renderer inspection.
const vscode=require('vscode'),fs=require('fs'),path=require('path');
exports.run=async()=>{
 const dir=process.env.THEME_VISUAL_CONTROL;let last='';
 await vscode.commands.executeCommand('themeAudit.visualMin');
 await new Promise(r=>setTimeout(r,500));await vscode.commands.executeCommand('themeAudit.visualDracula');
 fs.writeFileSync(path.join(dir,'ready.json'),JSON.stringify({version:vscode.version,ready:true}));
 setInterval(async()=>{
  const file=path.join(dir,'request.json');if(!fs.existsSync(file))return;
  const request=JSON.parse(fs.readFileSync(file));if(request.id===last)return;last=request.id;
  try{
   const allowed={comments:'themeAudit.visualComments',dracula:'themeAudit.visualDracula',min:'themeAudit.visualMin',secondary:'themeAudit.secondary',explorer:'workbench.files.action.focusFilesExplorer',editor:'workbench.action.focusActiveEditorGroup',inspect:'editor.action.inspectTMScopes',settings:'workbench.action.openSettings',agents:'workbench.action.openAgentsWindow'};
   if(request.action==='secondary'){vscode.commands.executeCommand(allowed.secondary);fs.writeFileSync(path.join(dir,'response.json'),JSON.stringify({id:last,opened:true}));return;}
   let result;if(request.action==='capture')result=await vscode.commands.executeCommand('themeAudit.capture','visual-live');else {if(!allowed[request.action])throw Error('Unknown action');result=await vscode.commands.executeCommand(allowed[request.action]);}
   fs.writeFileSync(path.join(dir,'response.json'),JSON.stringify({id:last,done:true,result}));
  }catch(e){fs.writeFileSync(path.join(dir,'response.json'),JSON.stringify({id:last,error:String(e)}));}
 },500);
 await new Promise(()=>{});
};
