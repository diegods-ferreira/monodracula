const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'monodracula-yellow-')),app='C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app';
const ts=require(app+'/extensions/node_modules/typescript/lib/typescript.js');
const parse=s=>{const r=ts.parseConfigFileTextToJson('theme.json',s);if(r.error)throw Error('Invalid JSONC');return r.config;};
fs.mkdirSync(root+'/themes',{recursive:true});fs.mkdirSync(root+'/fixtures',{recursive:true});fs.mkdirSync(root+'/data/User',{recursive:true});
const themes=[];
for(const name of ['MonoMin','MonoDracula'])for(const variant of ['Before','Candidate']){
 const theme=parse(fs.readFileSync(__dirname+'/baseline/'+name+'Theme.json','utf8'));
 if(variant==='Candidate')for(const k of ['list.highlightForeground','editor.findMatchForeground','editor.findMatchHighlightForeground'])theme.colors[k]=name==='MonoMin'?'#F8C66B':'#f1fa8c';
 const file=name+variant+'.json';fs.writeFileSync(root+'/themes/'+file,JSON.stringify(theme));themes.push({label:name+' '+variant,uiTheme:'vs-dark',path:file});
}
fs.writeFileSync(root+'/themes/package.json',JSON.stringify({name:'yellow-candidates',publisher:'local-audit',version:'0.0.1',engines:{vscode:'^1.146.0'},contributes:{themes}}));
const original=fs.readFileSync(process.env.APPDATA+'/Code/User/settings.json','utf8'),settings=parse(original);
fs.writeFileSync(root+'/data/User/settings.json',JSON.stringify({...settings,'workbench.colorTheme':'MonoMin Before','update.mode':'none','extensions.autoUpdate':false,'extensions.autoCheckUpdates':false,'[typescript]':{...settings['[typescript]'],'editor.semanticHighlighting.enabled':true},'[javascript]':{...settings['[javascript]'],'editor.semanticHighlighting.enabled':true}}));
const tsCode='export const contrastValue = "contrast contrast";\n// contrast comment\nconsole.log(contrastValue, "contrast");\n';
for(const ext of ['ts','js'])fs.writeFileSync(root+'/fixtures/contrast-target-demo.'+ext,tsCode);
fs.writeFileSync(root+'/fixtures/contrast-target-demo.html','<main data-name="contrast">contrast contrast</main>\n');
const text='Local contrast example request';fs.writeFileSync(root+'/fixtures/chat.json',JSON.stringify({responderUsername:'Local Fixture',initialLocation:'panel',requests:[{message:{text,parts:[{kind:'text',text,range:{start:0,endExclusive:text.length},editorRange:{startLineNumber:1,startColumn:1,endLineNumber:1,endColumn:text.length+1}}]},variableData:{variables:[]},response:[{value:'Local contrast response. Another contrast occurrence for native find.',isTrusted:false}]}]}));
const extensions='C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW/extensions',env={...process.env,YELLOW_CONTROL:root};delete env.ELECTRON_RUN_AS_NODE;delete env.THEME_VISUAL_LIVE;delete env.THEME_VISUAL_CONTROL;
const fd=fs.openSync(root+'/launch.log','w'),child=cp.spawn(path.resolve(app,'../../../Code.exe'),['--new-window','--sync','off','--locale','en-US','--skip-welcome','--disable-workspace-trust','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9371','--user-data-dir',root+'/data','--extensions-dir',extensions,'--extensionDevelopmentPath='+root+'/themes','--extensionDevelopmentPath='+path.join(__dirname,'probe'),root+'/fixtures'],{cwd:root,env,windowsHide:true,detached:true,stdio:['ignore',fd,fd]});child.unref();
fs.writeFileSync(__dirname+'/session.json',JSON.stringify({root,app,extensions,port:9371,originalSettingsSha256:crypto.createHash('sha256').update(original).digest('hex')},null,2));console.log({root,pid:child.pid});
