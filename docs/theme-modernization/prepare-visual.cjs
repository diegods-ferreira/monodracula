// Preparation only. Never starts VS Code or edits themes. --check only reads.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert');
const repo=path.resolve(__dirname,'../..');
const app=process.env.THEME_AUDIT_APP||'C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app';
const settings=process.env.THEME_AUDIT_SETTINGS||path.join(process.env.APPDATA,'Code/User/settings.json');
const extensions=process.env.THEME_AUDIT_EXTENSIONS||path.join(os.homedir(),'.vscode/extensions');
const ts=require(app+'/extensions/node_modules/typescript/lib/typescript.js');
function parse(s){const r=ts.parseConfigFileTextToJson('settings.json',s);assert(!r.error,'Invalid JSONC');return r.config;}
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline.json'))).commit;
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const version=JSON.parse(fs.readFileSync(app+'/package.json')).version;
assert.equal(version,'1.146.0','Use audited VS Code 1.146.0 or re-audit the new installation.');
const baseSettings=fs.existsSync(settings)?parse(fs.readFileSync(settings,'utf8')):{};
for(const f of ['package.json','themes/MonoMinTheme.json','themes/MonoDraculaTheme.json'])cp.execFileSync('git',['show',baseline+':'+f],{cwd:repo});
assert(fs.existsSync(extensions),'Extension source not found');
if(process.argv.includes('--check')){console.log(JSON.stringify({version,baseline,settings,extensions,ready:true},null,2));process.exit(0);}
assert(process.argv.includes('--prepare'),'Use --check or --prepare');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'monodracula-visual-'));
const write=(p,data)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data);};
const json=(p,data)=>write(p,JSON.stringify(data,null,2)+'\n');
const snapshot=path.join(root,'extensions');fs.mkdirSync(snapshot);
const extensionInventory=[];
for(const dir of fs.readdirSync(extensions)){const src=path.join(extensions,dir),manifest=path.join(src,'package.json');if(!fs.existsSync(manifest))continue;const pkg=JSON.parse(fs.readFileSync(manifest));if(pkg.publisher==='diego-ferreira'&&pkg.name==='monodracula')continue;fs.cpSync(src,path.join(snapshot,dir),{recursive:true,dereference:true});extensionInventory.push({id:pkg.publisher+'.'+pkg.name,version:pkg.version});}
fs.cpSync(path.join(__dirname,'visual-probe'),path.join(snapshot,'local-audit.theme-visual-probe-0.0.1'),{recursive:true});
const manifest={version,app,baseline,settingsSha256:sha(JSON.stringify(baseSettings)),extensions:extensionInventory,files:{},overrides:{'update.mode':'none','extensions.autoUpdate':false,'extensions.autoCheckUpdates':false,'workbench.colorTheme':'MonoDracula','window.dialogStyle':'custom'},limitations:['Fresh isolated profiles enable installed extensions by default; source profile enablement, authentication and remote state are not copied.','Extension-internal downloads/state are not frozen. Compare runtime inventories and server versions.']};
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'tokens.json'))).examples;
const names={'source.ts':'sample.ts','source.js':'sample.js','text.html.basic':'sample.html','source.css':'sample.css','source.css.scss':'sample.scss','source.json':'sample.json'};
for(const [scope,code] of Object.entries(fixtures))write(path.join(root,'fixtures',names[scope]),code+'\n');
write(path.join(root,'fixtures','visual-sample.ts'),fs.readFileSync(path.join(__dirname,'visual-sample.ts')));
write(path.join(root,'fixtures','comments.ts'),'// Explains the required validation; this text must remain readable.\n/** Public API contract. @param value Input value. */\nexport function normalize(value: string): string {\n  /* Preserve leading zeros: they are identifiers, not numbers. */\n  const prefix = "000";\n  return prefix + value.trim(); // Do not parse as a number.\n}\n');
json(path.join(root,'fixtures','tsconfig.json'),{compilerOptions:{strict:true,noEmit:true,target:'ES2022'},include:['*.ts']});
json(path.join(root,'fixtures','jsconfig.json'),{compilerOptions:{checkJs:true,target:'ES2022'},include:['*.js']});
const psQuote=s=>"'"+s.replaceAll("'","''")+"'";
const launcher=[];
for(const side of ['baseline','current']){
 const themeDir=path.join(root,side,'theme');
 for(const f of ['package.json','themes/MonoMinTheme.json','themes/MonoDraculaTheme.json']){const content=side==='baseline'?cp.execFileSync('git',['show',baseline+':'+f],{cwd:repo}):fs.readFileSync(path.join(repo,f));write(path.join(themeDir,f),content);manifest.files[side+'/'+f]=sha(content);}
 const data=path.join(root,side,'data');json(path.join(data,'User','settings.json'),{...baseSettings,...manifest.overrides});
 const code=path.resolve(app,'../../../bin/code.cmd');assert(fs.existsSync(code),code);
 launcher.push(`& ${psQuote(code)} --new-window --sync off --locale en-US --user-data-dir ${psQuote(data)} --extensions-dir ${psQuote(snapshot)} ${psQuote('--extensionDevelopmentPath='+themeDir)} ${psQuote(path.join(root,'fixtures'))}`);
}
json(path.join(root,'manifest.json'),manifest);
write(path.join(root,'launch.ps1'),launcher.join('\r\n')+'\r\n');
// Hash extension and grammar inputs for drift checks, independent of window-specific state.
function hashes(dir,base=dir,result={}){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())hashes(p,base,result);else if(d.isFile())result[path.relative(base,p)]=sha(fs.readFileSync(p));}return result;}
json(path.join(root,'extensions-sha256.json'),hashes(snapshot));
console.log(root);console.log('Prepared. Review manifest.json, then run launch.ps1 yourself.');
