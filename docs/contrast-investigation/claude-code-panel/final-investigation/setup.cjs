const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert'),source=path.resolve(__dirname,'../experiments'),previous=require('../../../theme-modernization/claude-code-prompt-border/session.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');for(const [f,h]of Object.entries(previous.files))assert.equal(sha(fs.readFileSync(f)),h,'Installed or protected baseline differs: '+f);
for(const f of ['control.cjs','cdp.cjs','snapshot.js','code-snapshot.js','native-snapshot.js','color.cjs','fixture.cjs'])fs.copyFileSync(source+'/'+f,__dirname+'/'+f);fs.cpSync(source+'/probe',__dirname+'/probe',{recursive:true});
let probe=fs.readFileSync(__dirname+'/probe/extension.cjs','utf8').replace("else if(r.action==='open')","else if(r.action==='layout'){for(const cmd of ['workbench.action.closeSidebar','workbench.action.closeAuxiliaryBar','workbench.action.joinAllGroups'])await vscode.commands.executeCommand(cmd);}\n  else if(r.action==='open')");fs.writeFileSync(__dirname+'/probe/extension.cjs',probe);
fs.writeFileSync(__dirname+'/prepare.cjs',fs.readFileSync(source+'/prepare.cjs','utf8').replaceAll('9402','9404'));
let cdp=fs.readFileSync(__dirname+'/cdp.cjs','utf8');cdp=cdp.replace("if(action==='close')",`if(action==='prototype'){
 if(kind!=='claude'||!['none','send','frame','lateral','combined'].includes(file))throw Error('Unsupported transient experiment');
 const css=file==='none'?'':fs.readFileSync(__dirname+'/prototypes/'+file+'.css','utf8');
 await evaluate('(()=>{if(!document.getElementById("root"))throw Error("Wrong context");document.getElementById("claude-contrast-transient")?.remove();const css='+JSON.stringify(css)+';if(css){const s=document.createElement("style");s.id="claude-contrast-transient";s.dataset.experiment='+JSON.stringify(file)+';s.textContent=css;document.head.append(s)}return{present:!!document.getElementById("claude-contrast-transient")};})()');
}
if(action==='close')`);fs.writeFileSync(__dirname+'/cdp.cjs',cdp);console.log('Disposable harness prepared. Original files untouched.');
