// VS Code Extension Host test entry point; modifies isolated profile settings only.
const vscode=require('vscode'),fs=require('fs'),assert=require('assert');
exports.run=async()=>{
 const root=vscode.workspace.workspaceFolders?.[0]?.uri;assert(root,'Fixture workspace required');
 const languages=['typescript','javascript','html','css','scss','json'];
 const files=['sample.ts','sample.js','sample.html','sample.css','sample.scss','sample.json','comments.ts'];
 const cfg=vscode.workspace.getConfiguration();
 const originals=Object.fromEntries(languages.map(l=>[l,cfg.get('['+l+']')]));
 const results=[];
 try{
  for(const theme of ['MonoDracula','MonoMin']){
   await cfg.update('workbench.colorTheme',theme,vscode.ConfigurationTarget.Global);
   for(const mode of ['profile','on','off']){
    for(const language of languages){const key='['+language+']';await cfg.update(key,mode==='profile'?originals[language]:{...originals[language],'editor.semanticHighlighting.enabled':mode==='on'},vscode.ConfigurationTarget.Global);}
    for(const file of files){const doc=await vscode.workspace.openTextDocument(vscode.Uri.joinPath(root,file));await vscode.window.showTextDocument(doc,{preview:false});
     let previous,stable=false,last;
     for(let attempt=0;attempt<6;attempt++){
      await new Promise(r=>setTimeout(r,1000));
      last=await vscode.commands.executeCommand('themeAudit.capture',theme+'-'+mode);
      const signature=JSON.stringify(last.semantic);
      if(previous===signature&&last.semantic.status==='returned'){stable=true;break;}previous=signature;if(attempt>=2&&last.semantic.status!=='returned')break;
     }
     results.push({...last,stable});
    }
   }
  }
 } finally {
  for(const language of languages)await cfg.update('['+language+']',originals[language],vscode.ConfigurationTarget.Global);
  await cfg.update('workbench.colorTheme','MonoDracula',vscode.ConfigurationTarget.Global);
  fs.writeFileSync(process.env.THEME_AUDIT_OUTPUT,JSON.stringify({results,limitation:'Actual editor/provider execution; resolved styles and screenshots still require inspection.'},null,2));
 }
};
