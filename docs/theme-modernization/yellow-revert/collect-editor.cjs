const fs=require('fs'),cp=require('child_process'),path=require('path'),base=__dirname,run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r));
const cdp=(a,...b)=>run('cdp.cjs','workbench',a,...b),snap=key=>{cdp('read',base+'/snapshot.js',base+'/evidence/'+key+'.json');cdp('shot',base+'/evidence/'+key+'.png');};
function ready(script){for(let i=0;i<8;i++){cdp('read',base+'/'+script,base+'/render-ready.json');if(JSON.parse(fs.readFileSync(base+'/render-ready.json')))return;}throw Error('State did not render: '+script);}
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Baseline','Restored']){
 const prefix=theme.toLowerCase()+'-'+variant.toLowerCase();control({action:'theme',theme:theme+' '+variant});control({action:'clear'});
 for(const lang of ['ts','js','html']){control({action:'clean',lang});cdp('editorfocus');control({action:'clean',lang});cdp('park');snap(prefix+'-'+lang+'-clean');cdp('editorfind');ready('editor-ready.js');cdp('park');snap(prefix+'-'+lang+'-find');cdp('key','Enter');ready('editor-ready.js');snap(prefix+'-'+lang+'-next');}
}
