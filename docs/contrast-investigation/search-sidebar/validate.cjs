const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),session=require('./session.json'),previous=require('./session-initial.json'),tables=require('./diagnostic-tables.json'),summary=require('./candidate-summary.json');
const ts=require(session.app+'/extensions/node_modules/typescript/lib/typescript.js'),parse=s=>{const r=ts.parseConfigFileTextToJson('theme.json',s);assert(!r.error);return r.config;},sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.deepStrictEqual(session.files,previous.files);assert.equal(session.version,previous.version);assert.deepStrictEqual(session.extensionsInventory,previous.extensionsInventory);
for(const [f,h]of Object.entries(session.files))assert.equal(sha(fs.readFileSync(f)),h,f+' changed');assert.equal(sha(fs.readFileSync(process.env.APPDATA+'/Code/User/settings.json')),session.originalSettingsSha256);
const variants=[];for(const s of [previous,session])for(const [label,delta]of Object.entries(s.variants)){
 const name=label.split(' ')[0],before=parse(fs.readFileSync('themes/'+name+'Theme.json','utf8')),after=parse(fs.readFileSync(s.root+'/themes/'+label.replaceAll(' ','')+'.json','utf8')),expected=structuredClone(before);Object.assign(expected.colors,delta);assert.deepStrictEqual(after,expected);assert.deepStrictEqual(after.tokenColors,before.tokenColors);
 const yellow=name==='MonoMin'?'#F8C66B':'#f1fa8c';for(const key of ['list.highlightForeground','editor.findMatchForeground','editor.findMatchHighlightForeground'])assert.equal(after.colors[key],yellow);
 if(name==='MonoDracula')for(const i of [0,1,90])assert.equal(after.tokenColors[i].settings.foreground,'#797fa5');
 variants.push({session:s.root,label,delta,onlyDeclaredTemporaryDelta:true,tokenColorsUnchanged:true,semanticConfigurationUnchanged:true});
}
for(const name of ['monomin','monodracula']){const base=tables.baseline.find(x=>x.theme===name+'-baseline'&&x.state==='normal');assert(base.pixelContrast<4.5);const info=tables.candidates.find(x=>x.theme===name&&x.variant==='infoforeground');assert.equal(info.pixelContrast,base.pixelContrast);}
assert(tables.baseline.find(x=>x.theme==='dark-modern'&&x.state==='normal').pixelContrast>=4.5);
assert(tables.candidates.find(x=>x.theme==='monomin'&&x.variant==='lowalpha').pixelContrast>=4.5);
assert(tables.candidates.find(x=>x.theme==='monodracula'&&x.variant==='lowalpha').pixelContrast<4.5);
for(const name of ['monomin','monodracula']){const c=summary.find(x=>x.case===name+'-lightbackground');assert(Math.min(...c.editorPixelContrast.map(x=>x.contrast))<4.5);assert(c.chatMeasured.every(x=>x.contrast<4.5));}
const validation={passed:true,protectedFilesUnchanged:true,personalSettingsUnchanged:true,temporaryVariants:variants,expectationsVerified:['Baseline Search contrast below 4.5 in both Mono themes','Dark Modern normal state above 4.5','Info foreground does not affect Search match color','Low alpha fixes sampled MonoMin normal contrast but not MonoDracula','Light backgrounds regress editor and chat contrast'],scope:'These checks validate the investigation and its evidence, not approval of any candidate for production.'};
fs.writeFileSync(__dirname+'/validation.json',JSON.stringify(validation,null,2)+'\n');console.log({passed:true,temporaryVariantsChecked:variants.length,protectedFilesUnchanged:true});
