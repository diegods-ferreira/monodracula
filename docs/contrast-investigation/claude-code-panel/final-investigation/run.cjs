// Transient inspector prototypes only; no theme/settings/bundle CSS overrides.
const fs=require('fs'),cp=require('child_process'),dir=__dirname,e=dir+'/evidence';fs.mkdirSync(e,{recursive:true});fs.writeFileSync(dir+'/prototypes/combined.css',fs.readFileSync(dir+'/prototypes/send.css','utf8')+'\n'+fs.readFileSync(dir+'/prototypes/frame.css','utf8'));
const run=(script,...args)=>cp.execFileSync(process.execPath,[dir+'/'+script,...args],{encoding:'utf8',timeout:45000,stdio:'pipe'}),control=o=>run('control.cjs',JSON.stringify(o)),cdp=(action,file,dest,kind='claude')=>run('cdp.cjs',kind,action,...file?[file]:[],...dest?[dest]:[]);
const capture=(name,source='snapshot.js',kind='claude')=>{cdp('read',dir+'/'+source,e+'/'+name+'.json',kind);if(kind==='claude')cdp('read',dir+'/identity.js',e+'/'+name+'-identity.json');cdp('shot',e+'/'+name+'.png',null,'workbench');console.log(name);};
const mode=name=>{cdp('clickMode','button.footerButtonPrimary_gGYT1w');cdp('clickMode','mode:'+name);};
const autoReady=async()=>{for(let i=0;i<12;i++){cdp('escape');try{mode('Auto');return;}catch(error){if(!error.stderr?.toString().includes('missing mode control mode:Auto'))throw error;console.log('Waiting for actual Auto availability, attempt '+(i+1));await new Promise(r=>setTimeout(r,5000));}}throw Error('Auto unavailable after initialization; do not force DOM or flags.');};
const sendStates=prefix=>{cdp('park');cdp('blur');capture(prefix+'-normal');cdp('hover','button[aria-label="Send message"]');capture(prefix+'-hover');cdp('park');cdp('focusElement','button[aria-label="Send message"]');capture(prefix+'-focus');cdp('blur');};
(async()=>{
 try{
  for(const theme of ['MonoMin','MonoDracula','Dark Modern']){
   const n=theme.toLowerCase().replaceAll(' ','-');cdp('prototype','none');control({action:'theme',theme});cdp('park');cdp('blur');await autoReady();cdp('draft');cdp('blur');sendStates(n+'-send-baseline');
   cdp('prototype','send');sendStates(n+'-send-candidate');
   mode('Manual');cdp('park');cdp('blur');capture(n+'-manual-candidate');cdp('prototype','none');capture(n+'-manual-baseline');mode('Auto');cdp('empty');cdp('blur');
   for(const prototype of ['none','frame','lateral']){
    cdp('prototype',prototype);cdp('park');cdp('code','0');const p=n+'-code-'+(prototype==='none'?'baseline':prototype);capture(p,'code-snapshot.js');cdp('hoverCopy','0');capture(p+'-copy','code-snapshot.js');cdp('hoverCopy','2');capture(p+'-syntax-copy','code-snapshot.js');
   }
   cdp('prototype','none');control({action:'dialog'});capture(n+'-native-baseline','native-snapshot.js','workbench');cdp('prototype','combined');capture(n+'-native-candidate','native-snapshot.js','workbench');cdp('escape',null,null,'workbench');cdp('prototype','none');cdp('park');cdp('code','0');capture(n+'-restored','code-snapshot.js');
  }
 }finally{cdp('prototype','none');cdp('read',dir+'/identity.js',dir+'/cleanup.json');}
})().catch(e=>{console.error(e.stderr?.toString()||e);process.exit(1)});
