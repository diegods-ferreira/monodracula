const fs=require('fs'),cp=require('child_process'),path=require('path'),base=__dirname,run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r));
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Baseline','Restored']){
 const prefix=theme.toLowerCase()+'-'+variant.toLowerCase();control({action:'theme',theme:theme+' '+variant});run('cdp.cjs','workbench','park');control({action:'quick',query:'contrast'});
 let ready=false;for(let i=0;i<8&&!ready;i++){run('cdp.cjs','workbench','read',base+'/quick-ready.js',base+'/quick-ready.json');ready=JSON.parse(fs.readFileSync(base+'/quick-ready.json'));}
 if(!ready)throw Error('Quick Open did not render results');
 for(const suffix of ['quick','quick-next']){if(suffix==='quick-next')run('cdp.cjs','workbench','key','ArrowDown');run('cdp.cjs','workbench','read',base+'/snapshot.js',base+'/evidence/'+prefix+'-'+suffix+'.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+prefix+'-'+suffix+'.png');}run('cdp.cjs','workbench','escape');
}
