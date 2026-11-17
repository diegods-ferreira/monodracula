const vscode=require('vscode'),fs=require('fs');
exports.activate=async context=>{
 const root=process.env.CLAUDE_AUDIT_CONTROL;if(!root)return;let last='';
 const errorRole=vscode.window.createStatusBarItem('contrastLab.errorRole',vscode.StatusBarAlignment.Left,100);errorRole.text='Local error role';errorRole.color=new vscode.ThemeColor('errorForeground');errorRole.show();context.subscriptions.push(errorRole);
 const scm=vscode.scm.createSourceControl('contrastLab','Local Contrast Lab',vscode.Uri.file(root+'/fixtures'));context.subscriptions.push(scm);const group=scm.createResourceGroup('fixture','Local fixture');group.resourceStates=[{resourceUri:vscode.Uri.file(root+'/fixtures/example.ts')}];
 context.subscriptions.push(vscode.commands.registerCommand('contrastLab.noop',()=>{}));const action=enabled=>{scm.actionButton={command:{command:'contrastLab.noop',title:'Local primary action'},enabled};};action(true);
 await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.file(root+'/fixtures/example.ts')),{preview:false});fs.writeFileSync(root+'/ready.json',JSON.stringify({version:vscode.version}));
 const timer=setInterval(async()=>{if(!fs.existsSync(root+'/request.json'))return;const r=JSON.parse(fs.readFileSync(root+'/request.json'));if(r.id===last)return;last=r.id;try{let result;
  if(r.action==='theme'){if(!['Dark Modern',...JSON.parse(fs.readFileSync(root+'/themes/package.json')).contributes.themes.map(t=>t.label)].includes(r.theme))throw Error('Invalid theme');await vscode.workspace.getConfiguration().update('workbench.colorTheme',r.theme,vscode.ConfigurationTarget.Global);}
  else if(r.action==='layout'){for(const cmd of ['workbench.action.closeSidebar','workbench.action.closeAuxiliaryBar','workbench.action.joinAllGroups'])await vscode.commands.executeCommand(cmd);}
  else if(r.action==='native'){action(!r.disabled);await vscode.commands.executeCommand('workbench.view.scm');}
  else if(r.action==='editor'){await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.file(root+'/fixtures/example.ts')),{preview:false});}
  else if(r.action==='open')await vscode.commands.executeCommand('claude-vscode.sidebar.open');
  else if(r.action==='fixture'){const fixture=JSON.parse(fs.readFileSync(root+'/fixture-session.json'));await vscode.commands.executeCommand('claude-vscode.editor.open',fixture.id);}
  else if(r.action==='quick')vscode.commands.executeCommand('workbench.action.quickOpen','contrast');
  else if(r.action==='settings')await vscode.commands.executeCommand('workbench.action.openSettings','editor.fontSize');
  else if(r.action==='dialog')vscode.window.showInformationMessage('Local visual control; no action will run.',{modal:true},'Local Action');
  else if(r.action==='search')await vscode.commands.executeCommand('workbench.action.findInFiles',{query:'Panel',triggerSearch:true});
  else if(r.action==='candidates'){await vscode.workspace.getConfiguration().update('workbench.colorCustomizations',r.colors,vscode.ConfigurationTarget.Global);}
  else throw Error('Unknown action');fs.writeFileSync(root+'/response.json',JSON.stringify({id:last,done:true,result}));
 }catch(e){fs.writeFileSync(root+'/response.json',JSON.stringify({id:last,error:String(e)}));}},300);context.subscriptions.push({dispose:()=>clearInterval(timer)});
};
