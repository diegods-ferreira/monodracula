const path=require('path'),cp=require('child_process');const base=__dirname;
const run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r));
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Before','Candidate']){
 control({action:'theme',theme:theme+' '+variant});control({action:'quick',query:'>Search: Clear Search Results'});run('cdp.cjs','workbench','key','Enter');
 for(const lang of ['ts','js','html']){control({action:'clean',lang});const key=theme.toLowerCase()+'-'+variant.toLowerCase()+'-'+lang+'-clean';run('cdp.cjs','workbench','read',base+'/snapshot.js',base+'/evidence/'+key+'.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+key+'.png');}
}
