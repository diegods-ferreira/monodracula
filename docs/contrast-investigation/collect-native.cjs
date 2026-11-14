const cp=require('child_process'),path=require('path');
const script=f=>path.join(__dirname,f);
const run=(file,...args)=>cp.execFileSync(process.execPath,[script(file),...args],{stdio:'inherit'});
for(const [theme,key]of [['MonoMin','monomin'],['MonoDracula','monodracula'],['Dark Modern','dark-modern']]){
 run('control.cjs','theme',theme);
 for(const [action,suffix]of [['search','search'],['editorFind','editor-find'],['quickOpen','quick-open']]){
  run('control.cjs',action);
  run('cdp.cjs','workbench','read',script('inspect-native.js'),script('evidence/'+key+'-'+suffix+'.json'));
  run('cdp.cjs','workbench','shot',script('evidence/'+key+'-'+suffix+'.png'));
  if(action==='quickOpen')run('cdp.cjs','workbench','escape');
 }
}
