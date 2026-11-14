const fs=require('fs'),path=require('path'),assert=require('assert'),cp=require('child_process');
const app='C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app';
const ts=require(app+'/extensions/node_modules/typescript/lib/typescript.js'),approval=require('./comments-approval.cjs');
const out=path.join(__dirname,'stage-b-comments');
const beforeText=fs.readFileSync(out+'/baseline/MonoDraculaTheme.json','utf8');
function parse(text){const r=ts.parseConfigFileTextToJson('theme.json',text);assert(!r.error);const ast=ts.parseJsonText('theme.json',text);function visit(n){if(ts.isObjectLiteralExpression(n)){const keys=n.properties.map(p=>p.name.text);assert.equal(keys.length,new Set(keys).size,'Duplicate key');}ts.forEachChild(n,visit);}visit(ast);return r.config;}
const before=parse(beforeText),expected=approval.expectedText(beforeText,ts);approval.assertTokens(before.tokenColors,parse(expected).tokenColors,'MonoDracula');
if(process.argv.includes('--apply')){assert.equal(fs.readFileSync('themes/MonoDraculaTheme.json','utf8'),beforeText,'Baseline is not current');fs.writeFileSync('themes/MonoDraculaTheme.json',expected);}
const afterText=fs.readFileSync('themes/MonoDraculaTheme.json','utf8'),after=parse(afterText);assert.equal(afterText,expected,'Unexpected text change');
approval.assertTokens(before.tokenColors,after.tokenColors,'MonoDracula');
const x=structuredClone(before),y=structuredClone(after);delete x.tokenColors;delete y.tokenColors;assert.deepStrictEqual(x,y);
for(const [file,baseline] of [['themes/MonoMinTheme.json','MonoMinTheme.json'],['package.json','package.json']])assert(fs.readFileSync(file).equals(fs.readFileSync(out+'/baseline/'+baseline)),file+' modified');
const diff=cp.spawnSync('git',['diff','--no-index','--',out+'/baseline/MonoDraculaTheme.json','themes/MonoDraculaTheme.json'],{encoding:'utf8'});assert.equal(diff.status,1);fs.writeFileSync(out+'/change.diff',diff.stdout);
const result={rules:approval.indices.map(i=>({index:i,scope:before.tokenColors[i].scope,from:before.tokenColors[i].settings.foreground,to:after.tokenColors[i].settings.foreground})),ruleCount:after.tokenColors.length,exactTextDelta:true,colorsUnchanged:true,semanticConfigurationUnchanged:true,monoMinBytesUnchanged:true,manifestBytesUnchanged:true};
fs.writeFileSync(out+'/structural.json',JSON.stringify(result,null,2)+'\n');console.log(result);
