const path=require('path'),cp=require('child_process'),base=__dirname,run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'});
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Baseline','Restored']){
 run('control.cjs',JSON.stringify({action:'theme',theme:theme+' '+variant}));run('cdp.cjs','workbench','explorer');const prefix=theme.toLowerCase()+'-'+variant.toLowerCase();
 run('cdp.cjs','workbench','read',base+'/ui-state.js',base+'/evidence/'+prefix+'-ui.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+prefix+'-ui.png');
}
