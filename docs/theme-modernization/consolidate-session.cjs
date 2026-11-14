const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert');
const root=path.resolve(process.argv[2]);
const results=['baseline','current'].map(s=>JSON.parse(fs.readFileSync(path.join(root,s,'runtime-captures.json'))).results);
const key=r=>r.label+'/'+r.file, pairs=[];
assert.equal(results[0].length,42);assert.equal(results[1].length,42);
const pairDir=path.join(root,'comparison-inputs');fs.mkdirSync(pairDir,{recursive:true});
for(const left of results[0]){
 const right=results[1].find(r=>key(r)===key(left));assert(right,'Missing '+key(left));
 const paths=['baseline','current'].map((side,i)=>{const p=path.join(pairDir,side+'.json');fs.writeFileSync(p,JSON.stringify(i?right:left));return p;});
 const command=cp.spawnSync(process.execPath,[path.join(__dirname,'compare-captures.cjs'),...paths],{encoding:'utf8'});
 const comparison=JSON.parse(command.stdout);
 pairs.push({case:key(left),exitCode:command.status,stable:left.stable&&right.stable,...comparison});
}
const expected=JSON.parse(fs.readFileSync(path.join(root,'extensions-sha256.json'))),added=[];
function walk(dir,base=dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p,base);else if(d.isFile()){const rel=path.relative(base,p);if(!(rel in expected))added.push(rel);}}}walk(path.join(root,'extensions'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));
const known=new Set([...manifest.extensions.map(e=>e.id.toLowerCase()+'@'+e.version),'local-audit.theme-visual-probe@0.0.1']);
const index=JSON.parse(fs.readFileSync(path.join(root,'extensions/extensions.json')));
assert(index.every(e=>known.has(e.identifier.id.toLowerCase()+'@'+e.version)),'Unexpected extension in generated index');
const unplannedAdded=added.filter(f=>!f.startsWith('local-audit.theme-visual-probe-0.0.1')&&f!=='extensions.json');
const summary={root,baseline:JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))).baseline,hostCases:results.map(r=>r.length),pairs,
 providerPassed:pairs.filter(p=>p.providerEvidenceEqual&&p.stable).length,
 providerAbsent:pairs.filter(p=>p.inconclusive&&!p.differing.length).length,generatedExtensionIndex:{file:'extensions.json',entries:index.length,knownVersionsOnly:true},
 finalProfileSettingsEqual:fs.readFileSync(path.join(root,'baseline/data/User/settings.json'),'utf8')===fs.readFileSync(path.join(root,'current/data/User/settings.json'),'utf8'),
 differing:pairs.filter(p=>p.differing.length),unplannedExtensionFiles:unplannedAdded,
 consistency:JSON.parse(fs.readFileSync(path.join(root,'consistency.json'))),
 rendering:'Not inspected; no screenshots captured. No visual test approved.',stageB:'Not executed'};
fs.writeFileSync(path.join(__dirname,'execution-results.json'),JSON.stringify(summary,null,2)+'\n');
console.log({pairs:pairs.length,providerPassed:summary.providerPassed,providerAbsent:summary.providerAbsent,differing:summary.differing.map(p=>({case:p.case,differing:p.differing})),unplannedExtensionFiles:unplannedAdded});
