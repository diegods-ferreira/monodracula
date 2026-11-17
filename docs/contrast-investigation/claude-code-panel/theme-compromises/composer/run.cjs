const fs=require('fs'),cp=require('child_process'),dir=__dirname,e=dir+'/evidence';fs.mkdirSync(e,{recursive:true});const run=(f,...args)=>cp.execFileSync(process.execPath,[dir+'/'+f,...args],{encoding:'utf8',timeout:45000,stdio:'pipe'}),control=o=>run('control.cjs',JSON.stringify(o)),cdp=(action,file,dest,kind='workbench')=>run('cdp.cjs',kind,action,...file?[file]:[],...dest?[dest]:[]);
const capture=(name,shot)=>{cdp('read',dir+'/chat-snapshot.js',e+'/'+name+'.json');if(shot)cdp('shot',e+'/'+name+'.png');console.log(name+(shot?' [PNG]':' [data]'));};
(async()=>{try{
 control({action:'search'});
 for(const theme of ['Dark Modern','MonoMin','MonoDracula','MonoMin Quiet','MonoMin Clear','MonoDracula Quiet','MonoDracula Clear']){
  const n=theme.toLowerCase().replaceAll(' ','-'),candidate=theme.includes('Quiet')||theme.includes('Clear');control({action:'theme',theme});control({action:'chat'});cdp('chatEmpty');cdp('blur');cdp('park');capture(n+'-empty-blur',true);cdp('hover','.chat-input-container');capture(n+'-empty-hover',false);cdp('park');cdp('chatFocus');capture(n+'-empty-focus',candidate);cdp('chatDraft');capture(n+'-filled-focus',true);cdp('blur');cdp('park');capture(n+'-filled-blur',candidate);
  cdp('focusElement','.search-view .monaco-inputbox :is(input,textarea)');capture(n+'-search-focus',false);cdp('blur');cdp('park');capture(n+'-shared-search',false);
  control({action:'settings'});capture(n+'-shared-settings',candidate&&theme.includes('Clear'));cdp('fixtureTab','Local visual contrast');cdp('read',dir+'/snapshot.js',e+'/'+n+'-claude.json','claude');control({action:'chat'});
 }
 }finally{control({action:'theme',theme:'MonoMin'});cdp('chatEmpty');cdp('blur');}})().catch(x=>{console.error(x.stderr?.toString()||x);process.exit(1)});
