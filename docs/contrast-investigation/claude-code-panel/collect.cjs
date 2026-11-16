const path=require('path'),cp=require('child_process'),base=__dirname,run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r)),cdp=(a,...b)=>run('cdp.cjs','claude',a,...b);
const snap=key=>{cdp('read',base+'/snapshot.js',base+'/evidence/'+key+'.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+key+'.png');};
for(const [theme,baseKey]of [['MonoMin','monomin'],['MonoDracula','monodracula'],['Dark Modern','dark-modern']]){const key=baseKey+(process.argv.includes('--auto')?'-auto':'');
 control({action:'theme',theme});cdp('empty');cdp('blur');cdp('park');snap(key+'-empty-normal');
 cdp('hover','fieldset[class*="inputContainer_"]');snap(key+'-empty-hover');
 cdp('hover','button[aria-label="Send message"]');snap(key+'-disabled-hover');
 cdp('focus');snap(key+'-empty-focus');cdp('draft');snap(key+'-draft-focus');cdp('blur');cdp('park');snap(key+'-enabled-normal');
 cdp('hover','button[aria-label="Send message"]');snap(key+'-enabled-hover');cdp('park');cdp('focusElement','button[aria-label="Send message"]');snap(key+'-enabled-focus');
 cdp('empty');cdp('blur');
}
