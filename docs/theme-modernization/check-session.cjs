const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))),expected=JSON.parse(fs.readFileSync(path.join(root,'extensions-sha256.json')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const differences=[];
for(const [file,hash]of Object.entries(expected)){
 const actual=sha(fs.readFileSync(path.join(root,'extensions',file)));
 if(actual!==hash)differences.push(file);
}
const unexpected=differences.filter(f=>!f.startsWith('local-audit.theme-visual-probe-0.0.1'));
const themeDifferences=[];
for(const [key,hash]of Object.entries(manifest.files)){
 const p=path.join(root,key.replace('/package.json','/theme/package.json').replace('/themes/','/theme/themes/'));
 if(sha(fs.readFileSync(p))!==hash)themeDifferences.push(key);
 if(key.startsWith('current/')){const file=key.slice('current/'.length);if(sha(fs.readFileSync(path.resolve(__dirname,'../..',file)))!==hash)themeDifferences.push('workspace/'+file);}
}
const grammars={};for(const dir of fs.readdirSync(manifest.app+'/extensions')){
 const pkgPath=path.join(manifest.app,'extensions',dir,'package.json');if(!fs.existsSync(pkgPath))continue;
 const pkg=JSON.parse(fs.readFileSync(pkgPath));for(const g of pkg.contributes?.grammars||[]){const file=path.resolve(path.dirname(pkgPath),g.path);grammars[g.scopeName]={extension:pkg.name,version:pkg.version,sha256:sha(fs.readFileSync(file))};}
}
const ts=require(manifest.app+'/extensions/node_modules/typescript/lib/typescript.js');
const sourceSettings=path.join(process.env.APPDATA,'Code/User/settings.json');
const parsed=ts.parseConfigFileTextToJson('settings.json',fs.readFileSync(sourceSettings,'utf8'));assert(!parsed.error);
const sourceSettingsUnchanged=sha(JSON.stringify(parsed.config))===manifest.settingsSha256;
const result={extensionFilesChecked:Object.keys(expected).length,unexpectedExtensionDifferences:unexpected,probeDifferences:differences.filter(f=>!unexpected.includes(f)),themeDifferences,builtinGrammarInputs:grammars,sourceSettingsUnchanged,passed:!unexpected.length&&!themeDifferences.length&&sourceSettingsUnchanged};
fs.writeFileSync(path.join(root,'consistency.json'),JSON.stringify(result,null,2));
console.log({extensionFilesChecked:result.extensionFilesChecked,unexpectedExtensionDifferences:unexpected,themeDifferences,passed:result.passed});assert(result.passed);
