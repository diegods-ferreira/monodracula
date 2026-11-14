const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const source='C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'monodracula-comments-'));
const baseline=path.join(__dirname,'stage-b-comments/baseline'),extensions=source+'/extensions';
const probe=extensions+'/local-audit.theme-visual-probe-0.0.1';fs.cpSync(path.join(__dirname,'visual-probe'),probe,{recursive:true});
fs.cpSync(source+'/fixtures',root+'/fixtures',{recursive:true});
fs.writeFileSync(root+'/fixtures/comments-validation.ts',`// Line comment: preserve the input identifier.\n/* Block comment: do not parse leading zeros. */\n/**\n * Format the identifier.\n * @param value The original identifier.\n * @returns A readable label.\n */\nexport function formatIdentifier(value: string): string {\n  const prefix = "ID:";\n  return prefix + value.trim(); // Trailing comment: keep the original value.\n}\nconst result = formatIdentifier("00042");\n`);
for(const [i,side]of ['baseline','current'].entries()){
 const dir=root+'/'+side;fs.mkdirSync(dir+'/theme/themes',{recursive:true});fs.mkdirSync(dir+'/data/User',{recursive:true});fs.mkdirSync(dir+'/live');
 for(const f of ['MonoDraculaTheme.json','MonoMinTheme.json'])fs.copyFileSync(side==='baseline'?baseline+'/'+f:'themes/'+f,dir+'/theme/themes/'+f);
 fs.copyFileSync(side==='baseline'?baseline+'/package.json':'package.json',dir+'/theme/package.json');
 fs.copyFileSync(source+'/baseline/visual-data/User/settings.json',dir+'/data/User/settings.json');
 const env={...process.env,THEME_VISUAL_CONTROL:dir+'/live',THEME_VISUAL_LIVE:'1'};delete env.ELECTRON_RUN_AS_NODE;
 const fd=fs.openSync(dir+'/launch.log','w');const child=cp.spawn('C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/Code.exe',['--new-window','--sync','off','--locale','en-US','--skip-welcome','--disable-workspace-trust','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+(9351+i),'--user-data-dir',dir+'/data','--extensions-dir',extensions,'--extensionDevelopmentPath='+dir+'/theme','--extensionDevelopmentPath='+probe,root+'/fixtures'],{cwd:root,env,windowsHide:true,detached:true,stdio:['ignore',fd,fd]});child.unref();console.log(side,child.pid);
}
fs.writeFileSync(path.join(__dirname,'stage-b-comments/session.json'),JSON.stringify({root,extensions,ports:[9351,9352],version:'1.146.0'},null,2));console.log(root);
