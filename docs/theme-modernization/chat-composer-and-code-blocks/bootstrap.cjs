// Snapshot the pre-change workspace; edit only the four explicitly approved values.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert');
const dir=__dirname,old=path.resolve(dir,'../../contrast-investigation/claude-code-panel/theme-compromises'),composer=old+'/composer',sha=x=>crypto.createHash('sha256').update(x).digest('hex');
fs.mkdirSync(dir+'/before',{recursive:true});fs.mkdirSync(dir+'/evidence',{recursive:true});
const deltas={MonoMin:{'input.border':'#888888ad','textCodeBlock.background':'#00000099'},MonoDracula:{'input.border':'#939293ad','textCodeBlock.background':'#14141b'}};
assert(!fs.existsSync(dir+'/baseline.json'),'Baseline already exists; do not overwrite it');
const previous=require(old+'/session.json'),baseline={commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),date:new Date().toISOString(),status:cp.execFileSync('git',['status','--short'],{encoding:'utf8'}),app:previous.app,originalExtension:previous.originalExtension,files:{},deltas};
for(const name of ['MonoMin','MonoDracula']){const f='themes/'+name+'Theme.json';fs.copyFileSync(f,dir+'/before/'+name+'Theme.json');baseline.files[f]=sha(fs.readFileSync(f));}
fs.copyFileSync('package.json',dir+'/before/package.json');baseline.files['package.json']=sha(fs.readFileSync('package.json'));
fs.writeFileSync(dir+'/baseline.json',JSON.stringify(baseline,null,2)+'\n');
for(const name of ['MonoMin','MonoDracula']){const f='themes/'+name+'Theme.json';let text=fs.readFileSync(f,'utf8');for(const [k,v]of Object.entries(deltas[name])){const re=new RegExp('("'+k.replaceAll('.','\\.')+'": )"#[a-fA-F0-9]+"','g');assert.equal([...text.matchAll(re)].length,1);text=text.replace(re,(_,p)=>p+JSON.stringify(v));}fs.writeFileSync(f,text);}
for(const f of ['cdp.cjs','control.cjs','snapshot.js','code-snapshot.js','color.cjs','fixture.cjs','chat-snapshot.js'])fs.copyFileSync(composer+'/'+f,dir+'/'+f);
fs.copyFileSync(old+'/editor-snapshot.js',dir+'/editor-snapshot.js');fs.cpSync(composer+'/probe',dir+'/probe',{recursive:true});
let probe=fs.readFileSync(dir+'/probe/extension.cjs','utf8').replace("else if(r.action==='open')","else if(r.action==='editor')await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.file(root+'/fixtures/example.ts')),{preview:false});\n  else if(r.action==='open')");fs.writeFileSync(dir+'/probe/extension.cjs',probe);
let prepare=fs.readFileSync(composer+'/prepare.cjs','utf8').replaceAll('9407','9408').replace("require('../../../../../package.json')","require('../../../package.json')");
const a=prepare.indexOf("const variants=require('./variants.cjs');"),z=prepare.indexOf("fs.writeFileSync(root+'/themes/package.json'",a);assert(a>0&&z>a);
prepare=prepare.slice(0,a)+`for(const name of ['MonoMin','MonoDracula']){const file=name+'Baseline.json';fs.copyFileSync(__dirname+'/before/'+name+'Theme.json',root+'/themes/'+file);themes.push({label:name+' Baseline',uiTheme:'vs-dark',path:file});}\n`+prepare.slice(z);
fs.writeFileSync(dir+'/prepare.cjs',prepare);console.log('Baseline saved and exactly four substitutions applied. Test profile not started yet.');
