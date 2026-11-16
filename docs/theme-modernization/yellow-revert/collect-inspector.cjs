const fs=require('fs'),path=require('path'),cp=require('child_process'),base=__dirname,run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r)),cdp=(a,...b)=>run('cdp.cjs','workbench',a,...b);
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Baseline','Restored']){
 control({action:'theme',theme:theme+' '+variant});control({action:'clear'});control({action:'clean',lang:'ts'});cdp('editorfocus');control({action:'clean',lang:'ts'});cdp('token');control({action:'quick',query:'>Developer: Inspect Editor Tokens and Scopes'});
 let ready=false;for(let i=0;i<8&&!ready;i++){cdp('read',base+'/inspect-ready.js',base+'/render-ready.json');ready=JSON.parse(fs.readFileSync(base+'/render-ready.json'));}if(!ready)throw Error('Token inspector command not available in editor context');cdp('key','Enter');
 const prefix=theme.toLowerCase()+'-'+variant.toLowerCase();cdp('read',base+'/inspect-token.js',base+'/evidence/'+prefix+'-inspector.json');cdp('shot',base+'/evidence/'+prefix+'-inspector.png');cdp('escape');
}
