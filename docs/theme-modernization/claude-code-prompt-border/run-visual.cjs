const fs=require('fs'),path=require('path'),cp=require('child_process'),dir=__dirname,e=dir+'/evidence';fs.mkdirSync(e,{recursive:true});
const run=(script,...args)=>cp.execFileSync(process.execPath,[dir+'/'+script,...args],{encoding:'utf8',timeout:60000,stdio:'pipe'});
// control.cjs prints inspected objects; request responses are also read directly.
const request=o=>{run('control.cjs',JSON.stringify(o));return JSON.parse(fs.readFileSync(require('./session.json').root+'/response.json')).result;};
const cdp=(action,file,dest,kind='claude')=>run('cdp.cjs',kind,action,...file?[file]:[],...dest?[dest]:[]);
const capture=(name,source='snapshot.js',kind='claude')=>{cdp('read',dir+'/'+source,e+'/'+name+'.json',kind);cdp('shot',e+'/'+name+'.png',null,'workbench');console.log(name);};
const mode=name=>{cdp('clickMode','button.footerButtonPrimary_gGYT1w');cdp('clickMode','mode:'+name);};
(async()=>{
 request({action:'tokens'});cdp('fixtureTab','Local visual contrast',null,'workbench');await new Promise(r=>setTimeout(r,1000));
 for(const [theme,value]of [['MonoMin','#888888ad'],['MonoDracula','#939293a6']])for(const phase of ['baseline','approved','current']){
  if(process.argv[2]&&process.argv[2]!==theme)continue;if(process.argv[3]&&process.argv[3]!==phase)continue;
  const n=theme.toLowerCase()+'-'+phase;request({action:'theme',theme:phase==='current'?theme:theme+' Baseline'});request({action:'candidates',colors:phase==='approved'?{'inlineChatInput.border':value}:{}});cdp('fixtureTab','Local visual contrast',null,'workbench');cdp('escape');mode('Manual');cdp('park');cdp('blur');capture(n+'-blur');cdp('hover','fieldset[class*=inputContainer_]');capture(n+'-hover');cdp('park');cdp('focus');capture(n+'-manual-focus');mode('Plan');cdp('focus');capture(n+'-plan-focus');
  mode('Auto');cdp('focus');capture(n+'-auto-focus');cdp('draft');cdp('blur');cdp('park');capture(n+'-auto-enabled');cdp('empty');cdp('blur');cdp('park');cdp('hoverCopy','0');capture(n+'-code','code-snapshot.js');cdp('read',dir+'/shared-snapshot.js',e+'/'+n+'-shared.json');
  request({action:'search'});capture(n+'-native','native-snapshot.js','workbench');
  let token;for(let attempt=0;attempt<6;attempt++){token=request({action:'tokens'});if(token?.semantic?.status==='returned')break;await new Promise(r=>setTimeout(r,1000));}fs.writeFileSync(e+'/'+n+'-tokens.json',JSON.stringify(token,null,2));capture(n+'-editor','editor-snapshot.js','workbench');
 }
 request({action:'candidates',colors:{}});
})().catch(e=>{console.error(e.stderr?.toString()||e);process.exit(1)});
