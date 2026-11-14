const fs=require('fs'),path=require('path'),crypto=require('crypto');
const app='C:/Users/diego/AppData/Local/Programs/Microsoft VS Code/69047191fc/resources/app';
const js=fs.readFileSync(app+'/out/vs/workbench/workbench.desktop.main.js','utf8'),css=fs.readFileSync(app+'/out/vs/workbench/workbench.desktop.main.css','utf8');
const registrations=[...js.matchAll(/\bue\("([\w.]+)"/g)].map(m=>({id:m[1],offset:m.index,code:js.slice(m.index,m.index+700)}));
const snippets=(s,k)=>{const out=[];let p=-1;while((p=s.indexOf(k,p+1))!==-1&&out.length<30)out.push({offset:p,code:s.slice(Math.max(0,p-300),p+k.length+550)});return out;};
const result={version:require(app+'/package.json').version,app,bundles:{js:crypto.createHash('sha256').update(js).digest('hex'),css:crypto.createHash('sha256').update(css).digest('hex')},registrations:registrations.filter(x=>/search|findMatch|list\..*(Foreground|Background)/i.test(x.id)),css:snippets(css,'findInFileMatch'),js:snippets(js,'findInFileMatch'),chat:snippets(css,'chat-find-other-match')};
fs.writeFileSync(__dirname+'/source-evidence.json',JSON.stringify(result,null,2));console.log(JSON.stringify({registered:result.registrations.map(x=>x.id),css:result.css},null,2));
