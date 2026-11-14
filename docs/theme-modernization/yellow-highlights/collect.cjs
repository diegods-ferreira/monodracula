const fs=require('fs'),path=require('path'),cp=require('child_process');
const base=__dirname,run=(name,...args)=>cp.execFileSync(process.execPath,[path.join(base,name),...args],{stdio:'inherit'});
const control=r=>run('control.cjs',JSON.stringify(r));
const snap=name=>{run('cdp.cjs','workbench','read',base+'/snapshot.js',base+'/evidence/'+name+'.json');run('cdp.cjs','workbench','shot',base+'/evidence/'+name+'.png');};
for(const theme of ['MonoMin','MonoDracula'])for(const variant of ['Before','Candidate']){
 const key=theme.toLowerCase()+'-'+variant.toLowerCase();control({action:'theme',theme:theme+' '+variant});
 for(const [query,suffix]of [['contrast','quick'],['ctdm','quick-multi']]){control({action:'quick',query});snap(key+'-'+suffix);run('cdp.cjs','workbench','key','ArrowDown');snap(key+'-'+suffix+'-next');run('cdp.cjs','workbench','escape');}
 for(const lang of ['ts','js','html']){control({action:'clean',lang});snap(key+'-'+lang+'-clean');control({action:'editor',lang});snap(key+'-'+lang+'-find');control({action:'next'});snap(key+'-'+lang+'-next');if(lang==='ts'){control({action:'select'});snap(key+'-ts-selection');}}
 control({action:'search'});snap(key+'-search');
 control({action:'shortcuts'});snap(key+'-shortcuts');run('cdp.cjs','workbench','read',base+'/close-shortcuts.js');control({action:'clean',lang:'ts'});
 control({action:'chat'});run('cdp.cjs','workbench','read',base+'/chat-query.js');snap(key+'-chat');control({action:'chatNext'});snap(key+'-chat-next');
}
