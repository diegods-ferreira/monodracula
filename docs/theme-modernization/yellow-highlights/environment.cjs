const fs=require('fs'),crypto=require('crypto'),assert=require('assert'),session=require('./session.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const settingsHash=hash(fs.readFileSync(process.env.APPDATA+'/Code/User/settings.json'));
assert.equal(settingsHash,session.originalSettingsSha256,'Personal settings changed');
const product=require(session.app+'/package.json'),extensions=fs.readdirSync(session.extensions).flatMap(dir=>{const file=session.extensions+'/'+dir+'/package.json';if(!fs.existsSync(file))return[];const p=JSON.parse(fs.readFileSync(file));return[{id:p.publisher+'.'+p.name,version:p.version,manifestSha256:hash(fs.readFileSync(file))}];});
const result={vscode:product.version,node:process.version,personalSettingsUnchanged:true,personalSettingsSha256:settingsHash,profile:session.root+'/data',extensionsDirectory:session.extensions,extensions,baseline:{}};
for(const name of ['MonoMin','MonoDracula'])result.baseline[name]=hash(fs.readFileSync(__dirname+'/baseline/'+name+'Theme.json'));
fs.writeFileSync(__dirname+'/environment.json',JSON.stringify(result,null,2)+'\n');console.log({vscode:result.vscode,personalSettingsUnchanged:true,extensions:extensions.length});
