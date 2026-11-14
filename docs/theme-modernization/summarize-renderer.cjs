const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const dir=path.join(__dirname,'visual-evidence');
const read=(side,theme,suffix='')=>JSON.parse(fs.readFileSync(path.join(dir,side+'-'+theme+suffix+'.json')));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const results=[];
for(const theme of ['dracula','min']){
 const a=read('baseline',theme,'-semantic'),b=read('current',theme,'-semantic');
 const ag=read('baseline',theme,'-guides'),bg=read('current',theme,'-guides');
 const af=read('baseline',theme,'-explorer-focus'),bf=read('current',theme,'-explorer-focus');
 const api=['baseline','current'].map(s=>read(s,theme,'-api').result);
 assert(api.every(r=>r.semanticSetting===true&&r.semantic.status==='returned'));
 const preserved={tokens:same(a.lines,b.lines),semanticInspector:same(a.inspectors,b.inspectors)&&a.inspectors.some(i=>i.text.includes('semantic token typevariable')),guides:same(ag.guideRendering,bg.guideRendering),activity:same(a.activityLabels,b.activityLabels),tabs:same(a.tabLabels,b.tabLabels),explorerInactive:same(a.explorer,b.explorer),explorerActive:same(af.explorer,bf.explorer)};
 assert(Object.values(preserved).every(Boolean),theme+' differs');
 const buttons={};for(const state of ['normal','hover','focus'])buttons[state]=Object.fromEntries(['baseline','current'].map(side=>{const r=read(side,theme,'-button-'+state),button=r.buttons.find(b=>b.text==='Secondary action');assert(button,theme+' '+side+' '+state+' absent');if(state==='focus')assert(r.activeElement.text==='Secondary action'&&button.style.outlineStyle==='solid');return [side,button.style];}));
 const agents=Object.fromEntries(['baseline','current'].map(side=>{const r=read(side,theme,'-agents');const consumers=r.agentRules.filter(x=>x.elements.length);assert(consumers.length);return [side,{theme:r.theme,consumers}];}));
 results.push({theme,preserved,semanticEnabled:true,documentSha256:api[0].documentSha256,documentEqual:api[0].documentSha256===api[1].documentSha256,buttons,agents});
}
const hashes={};for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.png')))hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex');
const manifest=JSON.parse(fs.readFileSync('C:/Users/diego/AppData/Local/Temp/monodracula-visual-d4JSyW/manifest.json'));
for(const file of ['themes/MonoMinTheme.json','themes/MonoDraculaTheme.json'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),manifest.files['current/'+file]);
fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify({results,pngSha256:hashes,themesUnchanged:true,regressionsObserved:[],limitation:'Representative TypeScript sample and UI states only; authenticated agent sessions not exercised.'},null,2)+'\n');
console.log(results.map(r=>({theme:r.theme,preserved:r.preserved,semanticEnabled:r.semanticEnabled,documentEqual:r.documentEqual,secondaryStates:3,agentConsumers:r.agents.current.consumers.length})));
