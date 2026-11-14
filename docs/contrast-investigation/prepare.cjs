const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'monodracula-contrast-'));
const app='C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app';
const ts=require(app+'/extensions/node_modules/typescript/lib/typescript.js');
const extensions='C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW/extensions';
fs.mkdirSync(root+'/data/User',{recursive:true});fs.mkdirSync(root+'/theme/themes',{recursive:true});
for(const f of ['MonoMinTheme.json','MonoDraculaTheme.json'])fs.copyFileSync('themes/'+f,root+'/theme/themes/'+f);fs.copyFileSync('package.json',root+'/theme/package.json');
const original=fs.readFileSync(path.join(process.env.APPDATA,'Code/User/settings.json'),'utf8');const r=ts.parseConfigFileTextToJson('settings.json',original);if(r.error)throw Error('Invalid settings');
fs.writeFileSync(root+'/data/User/settings.json',JSON.stringify({...r.config,'update.mode':'none','extensions.autoUpdate':false,'extensions.autoCheckUpdates':false,'workbench.colorTheme':'MonoMin'}));
for(const folder of ['recent','lib']){fs.mkdirSync(root+'/fixtures/'+folder,{recursive:true});fs.writeFileSync(root+'/fixtures/'+folder+'/contrast-demo.ts','export const contrastValue = "contrast";\n// contrast comment\nconsole.log(contrastValue);\n');}
const manifest={root,app,extensions,port:9361,version:JSON.parse(fs.readFileSync(app+'/package.json')).version,originalSettingsSha256:crypto.createHash('sha256').update(original).digest('hex'),files:{}};
for(const f of ['themes/MonoMinTheme.json','themes/MonoDraculaTheme.json','package.json'])manifest.files[f]=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
fs.writeFileSync(__dirname+'/session.json',JSON.stringify(manifest,null,2));
const env={...process.env,CONTRAST_CONTROL:root};delete env.ELECTRON_RUN_AS_NODE;const fd=fs.openSync(root+'/launch.log','w');
const c=cp.spawn(path.resolve(app,'../../../Code.exe'),['--new-window','--sync','off','--locale','en-US','--skip-welcome','--disable-workspace-trust','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9361','--user-data-dir',root+'/data','--extensions-dir',extensions,'--extensionDevelopmentPath='+root+'/theme','--extensionDevelopmentPath='+path.join(__dirname,'probe'),root+'/fixtures'],{cwd:root,env,windowsHide:true,detached:true,stdio:['ignore',fd,fd]});c.unref();console.log({root,pid:c.pid});
