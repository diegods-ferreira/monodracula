const fs=require('fs'),path=require('path'),assert=require('assert'),cp=require('child_process'),crypto=require('crypto');
const app='C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app',ts=require(app+'/extensions/node_modules/typescript/lib/typescript.js'),out=__dirname;
const parse=text=>{const r=ts.parseConfigFileTextToJson('theme.json',text);assert(!r.error);const ast=ts.parseJsonText('theme.json',text);function walk(n){if(ts.isObjectLiteralExpression(n)){const keys=n.properties.map(p=>p.name.text);assert.equal(keys.length,new Set(keys).size,'Duplicate key');}ts.forEachChild(n,walk);}walk(ast);return r.config;};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),keys=['list.highlightForeground','editor.findMatchForeground','editor.findMatchHighlightForeground'];
function reverse(text,name){const ast=ts.parseJsonText('theme.json',text),colors=ast.statements[0].expression.properties.find(p=>p.name.text==='colors').initializer,edits=[];
 for(const key of keys){const p=colors.properties.find(p=>p.name.text===key);assert(p,'Missing yellow property '+key);assert.equal(p.initializer.text,name==='MonoMin'?'#F8C66B':'#f1fa8c');
  if(key===keys[0])edits.push({start:p.initializer.getStart(ast),end:p.initializer.end,text:JSON.stringify(name==='MonoMin'?'#EAEAEA':'#fcfcfa')});
  else {const start=text.lastIndexOf('\n',p.getStart(ast))+1,end=text.indexOf('\n',p.end)+1;assert(end>p.end);assert(!text.slice(p.getStart(ast),p.end).includes('\n'));assert(/^,\s*$/.test(text.slice(p.end,end)));edits.push({start,end,text:''});}
 }
 for(const e of edits.sort((a,b)=>b.start-a.start))text=text.slice(0,e.start)+e.text+text.slice(e.end);return text;
}
fs.mkdirSync(out+'/before',{recursive:true});
if(process.argv.includes('--apply')){
 for(const name of ['MonoMin','MonoDracula']){const file='themes/'+name+'Theme.json',text=fs.readFileSync(file,'utf8'),saved=out+'/before/'+name+'Theme.json';if(fs.existsSync(saved))assert.equal(fs.readFileSync(saved,'utf8'),text,'Already applied or unrelated changes');else fs.writeFileSync(saved,text);const expected=reverse(text,name),historical=fs.readFileSync(path.join(out,'../yellow-highlights/baseline',name+'Theme.json'),'utf8');assert.deepStrictEqual(parse(expected),parse(historical),'Other theme differences; do not overwrite');}
 const pkg=out+'/before/package.json';assert(!fs.existsSync(pkg),'Before manifest already exists');fs.copyFileSync('package.json',pkg);
 for(const name of ['MonoMin','MonoDracula'])fs.writeFileSync('themes/'+name+'Theme.json',reverse(fs.readFileSync(out+'/before/'+name+'Theme.json','utf8'),name));
}
const reports=[],diffs=[];for(const name of ['MonoMin','MonoDracula']){
 const file='themes/'+name+'Theme.json',beforeText=fs.readFileSync(out+'/before/'+name+'Theme.json','utf8'),text=fs.readFileSync(file,'utf8'),historicalText=fs.readFileSync(path.join(out,'../yellow-highlights/baseline',name+'Theme.json'),'utf8'),before=parse(beforeText),current=parse(text),historical=parse(historicalText);
 assert.equal(text,reverse(beforeText,name),'Unauthorized textual delta');assert.deepStrictEqual(current,historical,'Restored theme differs from historical baseline');assert.deepStrictEqual(current.tokenColors,before.tokenColors);assert.equal(current.tokenColors.length,161);
 for(const k of ['semanticHighlighting','semanticTokenColors'])assert.deepStrictEqual(current[k],before[k]);
 for(const color of Object.values(current.colors))assert(/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(color));
 for(const k of keys.slice(1))assert(!Object.hasOwn(current.colors,k));
 const expected={...before.colors};expected[keys[0]]=name==='MonoMin'?'#EAEAEA':'#fcfcfa';for(const k of keys.slice(1))delete expected[k];assert.deepStrictEqual(current.colors,expected);
 if(name==='MonoDracula')for(const i of [0,1,90]){assert.equal(current.tokenColors[i].settings.foreground,'#797fa5');assert.equal(current.tokenColors[i].settings.fontStyle,before.tokenColors[i].settings.fontStyle);}
 const tokenSuffix=s=>s.slice(s.indexOf('"tokenColors"'));assert.equal(tokenSuffix(text),tokenSuffix(beforeText));
 const diff=cp.spawnSync('git',['diff','--no-index','--',out+'/before/'+name+'Theme.json',file],{encoding:'utf8'});assert.equal(diff.status,1);diffs.push(diff.stdout);
 reports.push({theme:name,changes:keys.map(k=>({property:k,before:before.colors[k],after:current.colors[k]??null})),exactAuthorizedTextDelta:true,historicalDeepEquality:true,historicalByteEquality:Buffer.from(text).equals(Buffer.from(historicalText)),tokenColorsBytesUnchanged:true,semanticConfigurationUnchanged:true,beforeSha256:sha(beforeText),restoredSha256:sha(text),historicalSha256:sha(historicalText)});
}
assert(fs.readFileSync('package.json').equals(fs.readFileSync(out+'/before/package.json')),'Manifest/version changed');
const pkg=JSON.parse(fs.readFileSync('package.json'));for(const name of ['MonoMin','MonoDracula'])assert(pkg.contributes.themes.some(t=>t.label===name&&t.path==='./themes/'+name+'Theme.json'&&t.uiTheme==='vs-dark'));
fs.writeFileSync(out+'/structural.json',JSON.stringify({reports,manifestUnchanged:true,version:pkg.version},null,2)+'\n');fs.writeFileSync(out+'/changes.diff',diffs.join('\n'));console.log({reports,manifestUnchanged:true,version:pkg.version});
