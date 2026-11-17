const fs=require('fs'),path=require('path'),p=__dirname+'/probe/extension.cjs';
let code=fs.readFileSync(p,'utf8');if(!code.includes("require('./token-probe.cjs')")){
 fs.copyFileSync(path.resolve(__dirname,'../claude-code-prompt-border/probe/token-probe.cjs'),__dirname+'/probe/token-probe.cjs');
 code=code.replace("exports.activate=async context=>{","exports.activate=async context=>{\n require('./token-probe.cjs').activate(context);");
 code=code.replace("else if(r.action==='open')",`else if(r.action==='semantic'){
 const cfg=vscode.workspace.getConfiguration(),prev=cfg.get('[typescript]')||{};
 await cfg.update('[typescript]',{...prev,'editor.semanticHighlighting.enabled':true},vscode.ConfigurationTarget.Global);
 const doc=await vscode.workspace.openTextDocument(vscode.Uri.file(root+'/fixtures/example.ts'));await vscode.window.showTextDocument(doc,{preview:false});
 for(let i=0;i<10;i++){result=await vscode.commands.executeCommand('themeAudit.capture',r.label);if(result.semantic.status==='returned'&&result.semantic.data.length)break;await new Promise(resolve=>setTimeout(resolve,1000));}
 }
 else if(r.action==='open')`);fs.writeFileSync(p,code);
}
const cdp=__dirname+'/cdp.cjs';let c=fs.readFileSync(cdp,'utf8');if(!c.includes("action==='reload'"))c=c.replace("if(action==='close')","if(action==='reload'){await send('Page.reload');}\nif(action==='close')");fs.writeFileSync(cdp,c);
