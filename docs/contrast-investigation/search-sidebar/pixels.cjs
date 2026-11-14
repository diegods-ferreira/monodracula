const fs=require('fs'),path=require('path'),cp=require('child_process');
const dir=__dirname+'/evidence';
for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!f.includes('-pixels')&&!f.includes('-regions'))){
 const snap=JSON.parse(fs.readFileSync(dir+'/'+file));if(!snap.rows)continue;
 const regions=[...snap.rows.flatMap(row=>row.matches.map(e=>({rect:e.rect,color:e.style.color,classes:row.classes+';selected='+row.ariaSelected+';hover='+row.hover}))),...snap.editor.lines.flatMap(l=>l.parts.filter(e=>/findMatchInline|currentFindMatchInline/.test(e.classes)).map(e=>({rect:e.rect,color:e.style.color,classes:e.classes})))];
 if(!regions.length)continue;const dest=dir+'/'+file.replace('.json','-regions.json');fs.writeFileSync(dest,JSON.stringify({dpr:snap.dpr,regions}));
 cp.execFileSync(process.execPath,[path.resolve(__dirname,'../../theme-modernization/yellow-highlights/png-background.cjs'),dir+'/'+file.replace('.json','.png'),dest],{stdio:'pipe'});
}
console.log('Screenshot background pixels measured');
