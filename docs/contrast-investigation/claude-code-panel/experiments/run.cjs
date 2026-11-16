// Only supported color customizations in the disposable VS Code profile.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const dir=__dirname,e=path.join(dir,'evidence');fs.mkdirSync(e,{recursive:true});
const run=(script,...args)=>cp.execFileSync(process.execPath,[path.join(dir,script),...args],{cwd:path.resolve(dir,'../../../..'),stdio:'pipe',timeout:45000});
const control=o=>run('control.cjs',JSON.stringify(o));
const cdp=(action,file,dest,kind='claude')=>run('cdp.cjs',kind,action,...file?[file]:[],...dest?[dest]:[]);
const capture=(name,source='snapshot.js')=>{cdp('read',path.join(dir,source),path.join(e,name+'.json'),['native-snapshot.js','inline-snapshot.js'].includes(source)?'workbench':'claude');cdp('shot',path.join(e,name+'.png'),null,'workbench');console.log(name);};
const colors=c=>control({action:'candidates',colors:c});
const mode=plan=>{cdp('clickMode','button.footerButtonPrimary_gGYT1w');cdp('clickMode',plan?'mode:Plan':'mode:Manual');};
async function main(){
 const stage=process.argv[2];
 if(stage==='native')for(const [theme,border]of [['MonoMin','#888888ad'],['MonoDracula','#939293a6']]){
  const n=theme.toLowerCase();control({action:'theme',theme});colors({});control({action:'search'});capture(n+'-native-final-baseline','native-snapshot.js');colors({'inlineChatInput.border':border});capture(n+'-native-final-candidate','native-snapshot.js');colors({});
 }
 if(stage==='inline')for(const [theme,border]of [['MonoMin','#888888ad'],['MonoDracula','#939293a6']]){
  const n=theme.toLowerCase();control({action:'theme',theme});colors({});capture(n+'-native-inline-baseline','inline-snapshot.js');colors({'inlineChatInput.border':border});capture(n+'-native-inline-candidate','inline-snapshot.js');colors({});
 }
 if(stage==='refine')for(const [theme,border]of [['MonoMin','#888888ad'],['MonoDracula','#939293a6']]){
  const n=theme.toLowerCase();control({action:'theme',theme});colors({});cdp('fixtureTab','Local visual contrast',null,'workbench');cdp('escape');mode(false);cdp('park');cdp('blur');capture(n+'-final-baseline');cdp('hoverCopy','0');capture(n+'-shared-baseline','shared-snapshot.js');cdp('park');
  colors({'inlineChatInput.border':border});cdp('blur');capture(n+'-final-candidate');cdp('hover','fieldset[class*=inputContainer_]');capture(n+'-final-hover');cdp('focus');capture(n+'-final-manual-focus');
  mode(true);cdp('focus');capture(n+'-final-plan-focus');cdp('blur');cdp('park');capture(n+'-final-plan-blur');cdp('clickMode','button.footerButtonPrimary_gGYT1w');cdp('clickMode','mode:Auto');cdp('draft');cdp('focus');capture(n+'-final-auto-focus');cdp('blur');cdp('hoverCopy','0');capture(n+'-shared-candidate','shared-snapshot.js');cdp('empty');cdp('blur');colors({});
 }
 if(stage==='auto')for(const [theme,dark]of [['MonoMin','#1f1f1f'],['MonoDracula','#282a36']]){
  const n=theme.toLowerCase();control({action:'theme',theme});colors({});cdp('escape');cdp('clickMode','button.footerButtonPrimary_gGYT1w');cdp('clickMode','mode:Auto');
  cdp('empty');cdp('blur');cdp('park');capture(n+'-auto-disabled');cdp('draft');cdp('blur');cdp('park');capture(n+'-auto-baseline');cdp('hover','button[aria-label="Send message"]');capture(n+'-auto-baseline-hover');cdp('park');cdp('focusElement','button[aria-label="Send message"]');capture(n+'-auto-baseline-focus');
  colors({'icon.foreground':dark});cdp('blur');cdp('park');capture(n+'-auto-icon-token');cdp('hover','button[aria-label="Send message"]');capture(n+'-auto-icon-token-hover');
  colors({'errorForeground':dark});cdp('park');cdp('blur');capture(n+'-auto-dark-error');cdp('hover','button[aria-label="Send message"]');capture(n+'-auto-dark-error-hover');cdp('park');cdp('focusElement','button[aria-label="Send message"]');capture(n+'-auto-dark-error-focus');
  colors({});cdp('empty');cdp('blur');
 }
 if(stage==='prompt')for(const [theme,border,neutral]of [['MonoMin','#888888ad','#5b595c'],['MonoDracula','#6272a4eb','#939293a6']]){
  const n=theme.toLowerCase();control({action:'theme',theme});colors({});cdp('escape');mode(false);cdp('park');cdp('blur');capture(n+'-prompt-baseline');
  cdp('focus');capture(n+'-prompt-baseline-manual-focus');cdp('blur');
  for(const [variant,value]of [['soft',border],['alternative',neutral]]){colors({'inlineChatInput.border':value});cdp('park');cdp('blur');capture(n+'-prompt-'+variant);cdp('hover','fieldset[class*=inputContainer_]');capture(n+'-prompt-'+variant+'-hover');cdp('focus');capture(n+'-prompt-'+variant+'-manual-focus');}
  colors({'inlineChatInput.border':border});mode(true);cdp('focus');capture(n+'-prompt-soft-plan-focus');cdp('blur');cdp('park');capture(n+'-prompt-soft-plan-blur');mode(false);
  colors({});control({action:'search'});capture(n+'-native-baseline','native-snapshot.js');colors({'inlineChatInput.border':border});capture(n+'-native-soft','native-snapshot.js');colors({});
 }
 if(stage==='code')for(const [theme,backgrounds]of [['MonoMin',[['dark','#101010'],['raised','#303030']]],['MonoDracula',[['dark','#1d1f28'],['raised','#282a36']]],['Dark Modern',[]]]){
  const n=theme.toLowerCase().replaceAll(' ','-');control({action:'theme',theme});colors({});cdp('blur');cdp('park');cdp('code','0');capture(n+'-code-baseline','code-snapshot.js');cdp('hoverCopy','0');capture(n+'-code-baseline-copy','code-snapshot.js');
  if(theme!=='Dark Modern'){
   colors({'editorWidget.border':'#888888','widget.border':'#888888','textBlockQuote.border':'#888888'});cdp('park');cdp('code','0');capture(n+'-code-border-tokens','code-snapshot.js');colors({});
   for(const [variant,value]of backgrounds){colors({'textCodeBlock.background':value});cdp('park');cdp('code','0');capture(n+'-code-'+variant,'code-snapshot.js');cdp('hoverCopy','0');capture(n+'-code-'+variant+'-copy','code-snapshot.js');cdp('code','2');capture(n+'-code-'+variant+'-syntax','code-snapshot.js');}
  }
  colors({});
 }
}
main().catch(e=>{console.error(e.stderr?.toString()||e);process.exit(1)});
