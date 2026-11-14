const vscode=require('vscode'),fs=require('fs');
exports.activate=async context=>{
 const root=process.env.SEARCH_CONTROL;if(!root)return;let last='';const uri=f=>vscode.Uri.file(root+'/fixtures/'+f);
 const open=async()=>vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri('alpha.ts')),{preview:false});await open();
 fs.writeFileSync(root+'/ready.json',JSON.stringify({version:vscode.version}));
 const timer=setInterval(async()=>{if(!fs.existsSync(root+'/request.json'))return;const r=JSON.parse(fs.readFileSync(root+'/request.json'));if(last===r.id)return;last=r.id;
  try{let result;
   if(r.action==='theme'){if(!/^(Mono(Min|Dracula) (Baseline|DarkBackground|LightBackground|InfoForeground|LowAlpha)|Dark Modern)$/.test(r.theme))throw Error('Invalid theme');await vscode.workspace.getConfiguration().update('workbench.colorTheme',r.theme,vscode.ConfigurationTarget.Global);}
   else if(r.action==='search'){await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');await vscode.commands.executeCommand('closeFindWidget');await vscode.commands.executeCommand('workbench.action.findInFiles',{query:'contrast',filesToInclude:'*.ts,*.js,*.html',triggerSearch:true});}
   else if(r.action==='editor'){const e=await open();await vscode.commands.executeCommand('editor.actions.findWithArgs',{searchString:'contrast',isRegex:false});await vscode.commands.executeCommand('editor.action.nextMatchFindAction');result={semantic:vscode.workspace.getConfiguration('editor',e.document).get('semanticHighlighting.enabled')};}
   else if(r.action==='select'){vscode.window.activeTextEditor.selection=new vscode.Selection(1,0,1,10);}
   else if(r.action==='chat'){await vscode.commands.executeCommand('workbench.action.chat.import',{inputPath:uri('chat.json'),target:'chatViewPane'});await vscode.commands.executeCommand('workbench.action.chat.find');}
   else if(r.action==='quick')vscode.commands.executeCommand('workbench.action.quickOpen',r.query);
   else throw Error('Invalid action');
   fs.writeFileSync(root+'/response.json',JSON.stringify({id:last,done:true,result}));
  }catch(e){fs.writeFileSync(root+'/response.json',JSON.stringify({id:last,error:String(e)}));}
 },300);context.subscriptions.push({dispose:()=>clearInterval(timer)});
};
