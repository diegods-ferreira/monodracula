const fs=require('fs'),cp=require('child_process'),dir=__dirname,e=dir+'/evidence';
const run=(f,...a)=>cp.execFileSync(process.execPath,[dir+'/'+f,...a],{encoding:'utf8',timeout:45000,stdio:'pipe'}),control=o=>run('control.cjs',JSON.stringify(o)),cdp=(kind,action,file,dest)=>run('cdp.cjs',kind,action,...file?[file]:[],...dest?[dest]:[]);
const capture=(name,kind,file,shot=true)=>{cdp(kind,'read',dir+'/'+file,e+'/'+name+'.json');if(shot)cdp('workbench','shot',e+'/'+name+'.png');console.log(name);};
(async()=>{try{
 for(const name of ['MonoMin','MonoDracula'])for(const baseline of [true,false]){
  const p=name.toLowerCase()+(baseline?'-baseline':'-current');control({action:'layout'});control({action:'theme',theme:name+(baseline?' Baseline':'')});control({action:'search'});control({action:'chat'});cdp('workbench','escape');
  cdp('workbench','chatEmpty');cdp('workbench','blur');cdp('workbench','park');capture(p+'-native-blur','workbench','chat-snapshot.js');
  cdp('workbench','chatFocus');capture(p+'-native-focus','workbench','chat-snapshot.js');cdp('workbench','chatDraft');capture(p+'-native-filled','workbench','chat-snapshot.js');cdp('workbench','blur');capture(p+'-native-filled-blur','workbench','chat-snapshot.js',false);
  cdp('workbench','focusElement','.search-view .monaco-inputbox :is(input,textarea)');capture(p+'-search-focus','workbench','chat-snapshot.js');cdp('workbench','blur');capture(p+'-search-blur','workbench','chat-snapshot.js',false);
  control({action:'settings'});capture(p+'-settings','workbench','chat-snapshot.js');
  cdp('workbench','escape');control({action:'layout'});control({action:'fixture'});cdp('claude','escape');cdp('claude','empty');cdp('claude','draft');cdp('claude','blur');cdp('claude','park');capture(p+'-claude-blur','claude','snapshot.js');
  cdp('claude','focus');capture(p+'-claude-focus','claude','snapshot.js');cdp('claude','blur');cdp('claude','code','0');capture(p+'-blocks','claude','code-snapshot.js');
  cdp('claude','hoverCopy','0');capture(p+'-copy-short','claude','code-snapshot.js');cdp('claude','hoverCopy','2');capture(p+'-copy-typescript','claude','code-snapshot.js');
  control({action:'editor'});capture(p+'-editor','workbench','editor-snapshot.js');
 }
 }finally{control({action:'theme',theme:'MonoMin'});}})().catch(x=>{console.error(x.stderr?.toString()||x);process.exit(1);});
