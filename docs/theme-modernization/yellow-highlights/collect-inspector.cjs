const cp=require('child_process'),path=require('path'),base=__dirname;
const run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r));
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Before','Candidate']){
 control({action:'theme',theme:theme+' '+variant});control({action:'clean',lang:'ts'});
 run('cdp.cjs','workbench','token');control({action:'quick',query:'>Developer: Inspect Editor Tokens and Scopes'});run('cdp.cjs','workbench','key','Enter');
 const key=theme.toLowerCase()+'-'+variant.toLowerCase()+'-inspector';
 run('cdp.cjs','workbench','read',base+'/inspect-token.js',base+'/evidence/'+key+'.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+key+'.png');run('cdp.cjs','workbench','escape');
}
