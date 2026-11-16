const path=require('path'),cp=require('child_process'),base=__dirname,run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r)),cdp=(a,...b)=>run('cdp.cjs','claude',a,...b);
const capture=(key,script='snapshot.js')=>{cdp('read',base+'/'+script,base+'/evidence/'+key+'.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+key+'.png');};
const native=key=>{run('cdp.cjs','workbench','read',base+'/native-snapshot.js',base+'/evidence/'+key+'.json');if(key.includes('dialog')){const data=JSON.parse(require('fs').readFileSync(base+'/evidence/'+key+'.json'));if(data.buttons.length<2)throw Error('Native test buttons were not rendered');}run('cdp.cjs','workbench','shot',base+'/evidence/'+key+'.png');};
for(const [theme,key,border,codeBg,dark]of [['MonoMin','monomin','#888888','#303030','#1f1f1f'],['MonoDracula','monodracula','#6272a4','#282a36','#282a36'],['Dark Modern','dark-modern',null,null,null]]){
 control({action:'theme',theme});control({action:'candidates',colors:{}});cdp('empty');cdp('blur');cdp('park');
 cdp('code','0');capture(key+'-code-baseline','code-snapshot.js');cdp('hoverCopy','0');capture(key+'-code-baseline-copy-hover','code-snapshot.js');cdp('code','2');capture(key+'-code-baseline-long','code-snapshot.js');
 if(!border)continue;
 control({action:'candidates',colors:{'textCodeBlock.background':codeBg}});cdp('park');cdp('code','0');capture(key+'-code-candidate','code-snapshot.js');cdp('hoverCopy','0');capture(key+'-code-candidate-copy-hover','code-snapshot.js');cdp('code','2');capture(key+'-code-candidate-long','code-snapshot.js');
 control({action:'candidates',colors:{}});control({action:'search'});native(key+'-native-baseline');control({action:'dialog'});native(key+'-dialog-baseline');run('cdp.cjs','workbench','escape');
 control({action:'candidates',colors:{'inlineChatInput.border':border}});cdp('blur');cdp('park');capture(key+'-border-candidate');native(key+'-native-narrow-border');cdp('focus');capture(key+'-border-candidate-focus');cdp('blur');
 control({action:'candidates',colors:{'input.border':border}});cdp('blur');capture(key+'-global-input-border');native(key+'-native-global-border');
 control({action:'candidates',colors:{'button.foreground':dark}});cdp('draft');cdp('blur');cdp('park');capture(key+'-auto-dark-icon-preview');control({action:'dialog'});native(key+'-dialog-dark-foreground');run('cdp.cjs','workbench','escape');cdp('empty');
 control({action:'candidates',colors:{}});cdp('blur');
}
