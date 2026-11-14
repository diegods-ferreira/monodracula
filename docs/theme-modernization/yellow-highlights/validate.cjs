const fs=require('fs'),path=require('path'),assert=require('assert'),cp=require('child_process'),crypto=require('crypto');
const app='C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app',ts=require(app+'/extensions/node_modules/typescript/lib/typescript.js');
const out=__dirname,stateFile=out+'/applied.json';
const previous=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile)).keys:[],keys=[...previous];
const allowed=['list.highlightForeground','editor.findMatchForeground','editor.findMatchHighlightForeground'];
if(process.argv.includes('--apply-quick')&&!keys.includes(allowed[0]))keys.push(allowed[0]);
if(process.argv.includes('--apply-editor'))for(const k of allowed.slice(1))if(!keys.includes(k))keys.push(k);
assert(keys.every(k=>allowed.includes(k)));
function parse(text){const r=ts.parseConfigFileTextToJson('theme.json',text);assert(!r.error);const ast=ts.parseJsonText('theme.json',text);function walk(n){if(ts.isObjectLiteralExpression(n)){const names=n.properties.map(p=>p.name.text);assert.equal(names.length,new Set(names).size,'Duplicate keys');}ts.forEachChild(n,walk);}walk(ast);return r.config;}
function expectedText(text,keys,yellow){
 const ast=ts.parseJsonText('theme.json',text),colors=ast.statements[0].expression.properties.find(p=>p.name.text==='colors').initializer;
 const changes=[];if(keys.includes(allowed[0])){const p=colors.properties.find(p=>p.name.text===allowed[0]);changes.push({start:p.initializer.getStart(ast),end:p.initializer.end,text:JSON.stringify(yellow)});}
 const added=keys.filter(k=>k!==allowed[0]);if(added.length){const eol=text.includes('\r\n')?'\r\n':'\n';changes.push({start:colors.getStart(ast)+1,end:colors.getStart(ast)+1,text:added.map(k=>eol+'\t\t'+JSON.stringify(k)+': '+JSON.stringify(yellow)+',').join('')});}
 for(const c of changes.sort((a,b)=>b.start-a.start))text=text.slice(0,c.start)+c.text+text.slice(c.end);return text;
}
const bundle=fs.readFileSync(app+'/out/vs/workbench/workbench.desktop.main.js','utf8');for(const key of keys)assert(bundle.includes('ue("'+key+'"'),'Unrecognized '+key);
const reports=[],diffs=[];
for(const name of ['MonoMin','MonoDracula']){
 const file='themes/'+name+'Theme.json',beforeText=fs.readFileSync(out+'/baseline/'+name+'Theme.json','utf8'),before=parse(beforeText),yellow=name==='MonoMin'?'#F8C66B':'#f1fa8c';assert(Object.values(before.colors).includes(yellow));
 const expected=expectedText(beforeText,keys,yellow);
 if(process.argv.some(a=>a.startsWith('--apply-'))){assert.equal(fs.readFileSync(file,'utf8'),expectedText(beforeText,previous,yellow),'Unrelated edit detected; refusing to overwrite');fs.writeFileSync(file,expected);}
 const afterText=fs.readFileSync(file,'utf8'),after=parse(afterText);assert.equal(afterText,expected,'Unexpected textual changes');
 assert.deepStrictEqual(after.tokenColors,before.tokenColors);assert.equal(after.tokenColors.length,161);
 if(name==='MonoDracula'){assert.equal(after.tokenColors[0].settings.foreground,'#797fa5');assert.equal(after.tokenColors[0].settings.fontStyle,'italic');}
 if(keys.length===3){const session=require('./session.json');assert.deepStrictEqual(after,parse(fs.readFileSync(session.root+'/themes/'+name+'Candidate.json','utf8')),'Installed theme differs from visually tested candidate');}
 const expectedColors={...before.colors};for(const key of keys)expectedColors[key]=yellow;assert.deepStrictEqual(after.colors,expectedColors);
 for(const c of Object.values(after.colors))assert(/^#(?:[a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.test(c));
 const a=structuredClone(before),b=structuredClone(after);delete a.colors;delete b.colors;assert.deepStrictEqual(a,b);
 const d=cp.spawnSync('git',['diff','--no-index','--',out+'/baseline/'+name+'Theme.json',file],{encoding:'utf8'});assert([0,1].includes(d.status));diffs.push(d.stdout);
 reports.push({theme:name,properties:keys.map(k=>({property:k,before:before.colors[k]??null,after:after.colors[k]})),tokenColorsEqual:true,semanticConfigurationEqual:true,onlyAuthorizedDelta:true});
}
assert(fs.readFileSync('package.json').equals(fs.readFileSync(out+'/baseline/package.json')),'Manifest changed');
fs.writeFileSync(stateFile,JSON.stringify({keys},null,2)+'\n');fs.writeFileSync(out+'/structural.json',JSON.stringify({reports,manifestUnchanged:true},null,2)+'\n');fs.writeFileSync(out+'/changes.diff',diffs.join('\n'));console.log(reports);
