const fs=require('fs'),cp=require('child_process'),assert=require('assert'),s=require('./session.json'),ts=require(s.app+'/extensions/node_modules/typescript/lib/typescript.js');
let diff='';for(const [name,color,source]of [['MonoMin','#888888ad','activityBar.foreground'],['MonoDracula','#939293a6','descriptionForeground']]){
 const file='themes/'+name+'Theme.json',text=fs.readFileSync(file,'utf8'),lines=text.split(/\r?\n/),p=ts.parseConfigFileTextToJson(file,text).config;assert(!Object.hasOwn(p.colors,'inlineChatInput.border'));assert.equal(p.colors[source].toLowerCase(),color.slice(0,7));
 const addition='\t\t"inlineChatInput.border": "'+color+'",',modified=text.replace('"colors": {','"colors": {\n'+addition),parsed=ts.parseConfigFileTextToJson(file,modified);assert(!parsed.error);delete parsed.config.colors['inlineChatInput.border'];assert.deepStrictEqual(parsed.config,p);
 diff+='diff --git a/'+file+' b/'+file+'\n--- a/'+file+'\n+++ b/'+file+'\n@@ -2,6 +2,7 @@\n'+lines.slice(1,7).map((l,i)=>(i===3?'+'+addition+'\n':'')+' '+l).join('\n')+'\n';
}
fs.writeFileSync(__dirname+'/proposed-theme.diff',diff);cp.execFileSync('git',['apply','--check',__dirname+'/proposed-theme.diff'],{stdio:'pipe'});console.log('Proposed patch applies cleanly; only two new properties in memory. No patch applied.');
