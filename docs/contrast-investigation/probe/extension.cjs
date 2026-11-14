const vscode=require('vscode'),fs=require('fs'),path=require('path');
exports.activate=async()=>{
 const dir=process.env.CONTRAST_CONTROL;if(!dir)return;
 const root=vscode.workspace.workspaceFolders[0].uri;let last='';
 for(const name of ['recent/contrast-demo.ts','lib/contrast-demo.ts'])await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root,name)),{preview:false});
 await vscode.commands.executeCommand('antigravity.panel.focus');
 fs.writeFileSync(path.join(dir,'ready.json'),JSON.stringify({version:vscode.version,ready:true}));
 setInterval(async()=>{const file=path.join(dir,'request.json');if(!fs.existsSync(file))return;const r=JSON.parse(fs.readFileSync(file));if(r.id===last)return;last=r.id;
  try{const cfg=vscode.workspace.getConfiguration();
   if(r.action==='theme'){if(!['MonoMin','MonoDracula','Dark Modern'].includes(r.theme))throw Error('Unsupported theme');await cfg.update('workbench.colorTheme',r.theme,vscode.ConfigurationTarget.Global);}
   else if(r.action==='antigravity')await vscode.commands.executeCommand('antigravity.panel.focus');
   else if(r.action==='quickOpen')vscode.commands.executeCommand('workbench.action.quickOpen','contrast');
   else if(r.action==='search')await vscode.commands.executeCommand('workbench.action.findInFiles',{query:'contrast',triggerSearch:true,isRegex:false});
   else if(r.action==='editorFind'){await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root,'recent/contrast-demo.ts')),{preview:false});await vscode.commands.executeCommand('editor.actions.findWithArgs',{searchString:'contrast'});}
   else throw Error('Unsupported action');
   fs.writeFileSync(path.join(dir,'response.json'),JSON.stringify({id:last,done:true,theme:cfg.get('workbench.colorTheme')}));
  }catch(e){fs.writeFileSync(path.join(dir,'response.json'),JSON.stringify({id:last,error:String(e)}));}
 },500);
};
