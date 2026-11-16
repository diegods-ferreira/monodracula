const vscode=require('vscode'),fs=require('fs'),path=require('path');
exports.activate=async context=>{
 const root=process.env.REVERT_CONTROL;if(!root)return;let last='';
 context.subscriptions.push(vscode.commands.registerCommand('yellowProbe.contrastDemo',()=>{}));
 const uri=file=>vscode.Uri.file(root+'/fixtures/'+file);
 async function open(lang='ts'){return vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri('contrast-target-demo.'+lang)),{preview:false});}
 await open('js');await open('html');await open();
 fs.writeFileSync(root+'/ready.json',JSON.stringify({version:vscode.version}));
 setInterval(async()=>{
  if(!fs.existsSync(root+'/request.json'))return;const r=JSON.parse(fs.readFileSync(root+'/request.json'));if(r.id===last)return;last=r.id;
  try{
   const cfg=vscode.workspace.getConfiguration();let result;
   if(r.action==='theme'){if(!['MonoMin Baseline','MonoMin Restored','MonoDracula Baseline','MonoDracula Restored'].includes(r.theme))throw Error('Invalid theme');await cfg.update('workbench.colorTheme',r.theme,vscode.ConfigurationTarget.Global);}
   else if(r.action==='quick')vscode.commands.executeCommand('workbench.action.quickOpen',r.query||'contrast');
   else if(r.action==='editor'){const editor=await open(r.lang);await vscode.commands.executeCommand('editor.actions.findWithArgs',{searchString:'contrast',isRegex:false});await vscode.commands.executeCommand('editor.action.nextMatchFindAction');result={language:editor.document.languageId,semantic:vscode.workspace.getConfiguration('editor',editor.document).get('semanticHighlighting.enabled')};}
   else if(r.action==='next')await vscode.commands.executeCommand('editor.action.nextMatchFindAction');
   else if(r.action==='select'){const editor=vscode.window.activeTextEditor;editor.selection=new vscode.Selection(1,0,1,10);}
   else if(r.action==='clean'){await open(r.lang);await vscode.commands.executeCommand('closeFindWidget');}
   else if(r.action==='clear')await vscode.commands.executeCommand('search.action.clearSearchResults');
   else if(r.action==='search')await vscode.commands.executeCommand('workbench.action.findInFiles',{query:'contrast',triggerSearch:true});
   else if(r.action==='shortcuts')await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings','contrast');
   else if(r.action==='chat'){await vscode.commands.executeCommand('workbench.action.chat.import',{inputPath:uri('chat.json'),target:'chatViewPane'});await vscode.commands.executeCommand('workbench.action.chat.find');}
   else if(r.action==='chatNext')await vscode.commands.executeCommand('workbench.action.chat.findNext');
   else throw Error('Invalid action');
   fs.writeFileSync(root+'/response.json',JSON.stringify({id:last,done:true,result}));
  }catch(e){fs.writeFileSync(root+'/response.json',JSON.stringify({id:last,error:String(e)}));}
 },300);
};
