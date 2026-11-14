const fs=require('fs'),{app}=require('./session.json');
const js=fs.readFileSync(app+'/out/vs/workbench/workbench.desktop.main.js','utf8'),css=fs.readFileSync(app+'/out/vs/workbench/workbench.desktop.main.css','utf8');
const patterns=['list.highlightForeground','quickInputList.focusHighlightForeground','editor.findMatchForeground','editor.findMatchHighlightForeground','chat-find-current-match','chat-find-other-match','findMatchInline','currentFindMatchInline'];
function excerpts(text,needle){const out=[];let p=-1;while(out.length<8&&(p=text.indexOf(needle,p+1))!==-1)out.push({offset:p,text:text.slice(Math.max(0,p-220),p+needle.length+350)});return out;}
fs.writeFileSync(__dirname+'/source-evidence.json',JSON.stringify({app,patterns:Object.fromEntries(patterns.map(p=>[p,{js:excerpts(js,p),css:excerpts(css,p.replaceAll('.','-'))}]))},null,2)+'\n');
console.log('Local registry and consumer excerpts saved');
