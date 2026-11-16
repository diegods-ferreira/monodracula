const cp=require('child_process'),path=require('path'),base=__dirname;
const run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r)),cdp=(a,...b)=>run('cdp.cjs','workbench',a,...b);
const snap=key=>{cdp('read',base+'/snapshot.js',base+'/evidence/'+key+'.json');cdp('shot',base+'/evidence/'+key+'.png');};
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Baseline','Restored']){
 const prefix=theme.toLowerCase()+'-'+variant.toLowerCase();control({action:'theme',theme:theme+' '+variant});control({action:'clear'});
 control({action:'search'});snap(prefix+'-search');control({action:'clean',lang:'ts'});control({action:'chat'});cdp('read',base+'/chat-query.js');snap(prefix+'-chat');control({action:'chatNext'});snap(prefix+'-chat-next');
 control({action:'clear'});control({action:'clean',lang:'ts'});cdp('token');control({action:'quick',query:'>Developer: Inspect Editor Tokens and Scopes'});cdp('key','Enter');
 cdp('read',base+'/inspect-token.js',base+'/evidence/'+prefix+'-inspector.json');cdp('shot',base+'/evidence/'+prefix+'-inspector.png');cdp('escape');
}
