const vscode = require('vscode');
const crypto = require('crypto');
exports.activate = context => {
  if(process.env.THEME_VISUAL_LIVE==='1')setTimeout(()=>require('./live.cjs').run().catch(console.error),1000);
  for(const [id,theme] of [['visualDracula','MonoDracula'],['visualMin','MonoMin'],['visualComments','MonoDracula']])context.subscriptions.push(vscode.commands.registerCommand('themeAudit.'+id,async()=>{
    const cfg=vscode.workspace.getConfiguration();
    await cfg.update('workbench.colorTheme',theme,vscode.ConfigurationTarget.Global);
    const prev=cfg.get('[typescript]')||{};
    await cfg.update('[typescript]',{...prev,'editor.semanticHighlighting.enabled':true},vscode.ConfigurationTarget.Global);
    await cfg.update('editor.guides.indentation',true,vscode.ConfigurationTarget.Global);
    await cfg.update('editor.guides.highlightActiveIndentation',true,vscode.ConfigurationTarget.Global);
    const root=vscode.workspace.workspaceFolders[0].uri;
    const other=await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root,'comments.ts'));
    await vscode.window.showTextDocument(other,{preview:false});
    const doc=await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root,id==='visualComments'?'comments-validation.ts':'visual-sample.ts'));
    const editor=await vscode.window.showTextDocument(doc,{preview:false});
    editor.selection=new vscode.Selection(9,4,9,4);
    await vscode.commands.executeCommand('workbench.view.explorer');
    await vscode.window.showTextDocument(doc,{preview:false});
  }));
  context.subscriptions.push(vscode.commands.registerCommand('themeAudit.capture', async (requestedLabel) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showErrorMessage('Open a fixture document first.');
    const doc=editor.document, cfg=vscode.workspace.getConfiguration('editor',doc), wc=vscode.workspace.getConfiguration('workbench',doc);
    const label=requestedLabel || await vscode.window.showInputBox({prompt:'Case label: MonoDracula-profile, MonoDracula-on, MonoDracula-off, etc.',validateInput:v=>/^[a-zA-Z0-9-]+$/.test(v)?undefined:'Use letters, numbers and hyphens.'});
    if(!label)return;
    let semantic;
    try {
      const legend=await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend',doc.uri);
      const tokens=await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens',doc.uri);
      semantic={status:tokens?'returned':'no-provider-or-no-result',legend,data:tokens?Array.from(tokens.data):null};
    } catch(e) { semantic={status:'error',message:String(e)}; }
    const snapshot={label,version:vscode.version,language:doc.languageId,file:doc.uri.path.split('/').pop(),
      documentSha256:crypto.createHash('sha256').update(doc.getText()).digest('hex'),dirty:doc.isDirty,
      theme:wc.get('colorTheme'),semanticSetting:cfg.get('semanticHighlighting.enabled'),
      semanticSettingSources:cfg.inspect('semanticHighlighting.enabled'),
      tokenCustomizations:cfg.get('tokenColorCustomizations'),semanticCustomizations:cfg.get('semanticTokenColorCustomizations'),
      font:{family:cfg.get('fontFamily'),size:cfg.get('fontSize'),weight:cfg.get('fontWeight'),ligatures:cfg.get('fontLigatures')},
      extensions:vscode.extensions.all.map(e=>({id:e.id,version:e.packageJSON.version,active:e.isActive})).sort((a,b)=>a.id.localeCompare(b.id)),semantic,
      limitation:'Provider tokens do not prove applied styles or semantic enablement. Inspect Editor Tokens and Scopes plus screenshots are required.'};
    const dir=vscode.Uri.joinPath(context.globalStorageUri,'captures');await vscode.workspace.fs.createDirectory(dir);
    const target=vscode.Uri.joinPath(dir,label+'-'+snapshot.file+'-'+Date.now()+'.json');
    await vscode.workspace.fs.writeFile(target,Buffer.from(JSON.stringify(snapshot,null,2)));
    if(!requestedLabel)await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(target),{preview:false});
    return snapshot;
  }));
  context.subscriptions.push(vscode.commands.registerCommand('themeAudit.secondary',async()=>{
    // VS Code's native notification actions use native primary and secondary buttons.
    await vscode.window.showInformationMessage('Theme audit: compare the secondary action in normal, hover and keyboard focus states.',{modal:true},'Primary action','Secondary action');
  }));
};
