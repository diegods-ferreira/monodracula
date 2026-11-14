const cp=require('child_process'),path=require('path'),base=__dirname;
const run=(f,...a)=>cp.execFileSync(process.execPath,[path.join(base,f),...a],{stdio:'inherit'}),control=r=>run('control.cjs',JSON.stringify(r)),cdp=(a,...b)=>run('cdp.cjs','workbench',a,...b);
const capture=key=>{cdp('read',base+'/snapshot.js',base+'/evidence/'+key+'.json');cdp('shot',base+'/evidence/'+key+'.png');};
const themes=process.argv.includes('--alpha')?['MonoMin LowAlpha','MonoDracula LowAlpha']:process.argv.includes('--baseline')?['MonoMin Baseline','MonoDracula Baseline','Dark Modern']:['MonoMin DarkBackground','MonoDracula DarkBackground','MonoMin LightBackground','MonoDracula LightBackground','MonoMin InfoForeground','MonoDracula InfoForeground'];
for(const theme of themes){const key=theme.toLowerCase().replaceAll(' ','-');control({action:'theme',theme});control({action:'search'});cdp('park');capture(key+'-normal');
 cdp('treehover');capture(key+'-hover');cdp('treeclick');cdp('park');capture(key+'-selected');cdp('treefocus');cdp('key','ArrowDown');capture(key+'-keyboard');
 control({action:'editor'});capture(key+'-editor');control({action:'select'});capture(key+'-selection');
 if(!theme.includes('InfoForeground')){control({action:'chat'});cdp('read',base+'/chat-query.js');capture(key+'-chat');}
}
