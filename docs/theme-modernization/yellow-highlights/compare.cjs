const fs=require('fs'),path=require('path'),assert=require('assert');
const dir=path.join(__dirname,'evidence'),read=(t,v,s)=>JSON.parse(fs.readFileSync(path.join(dir,t+'-'+v+'-'+s+'.json')));
const equal=(a,b)=>assert.deepStrictEqual(a,b);
const rgb=v=>{if(v.startsWith('#'))return[0,2,4].map(i=>parseInt(v.slice(1+i,3+i),16)).concat(1);const n=v.match(/[\d.]+/g).map(Number);return n.slice(0,3).concat(n[3]??1);};
const over=(a,b)=>{a=typeof a==='string'?rgb(a):a;b=typeof b==='string'?rgb(b):b;return a.slice(0,3).map((x,i)=>x*a[3]+b[i]*(1-a[3])).concat(1);};
const lum=a=>a.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=lum(typeof a==='string'?rgb(a):a),y=lum(typeof b==='string'?rgb(b):b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const background=(item,own=true)=>{let b=rgb('#000000');for(const p of [...item.ancestry].reverse())b=over(p.style.background,b);return own?over(item.style.background,b):b;};
const result=[];
for(const theme of ['monomin','monodracula']){
 const yellow=theme==='monomin'?'rgb(248, 198, 107)':'rgb(241, 250, 140)',data={theme,quick:[],editor:[],chat:[],searchUnchanged:true,shortcuts:[]};
 for(const suffix of ['quick','quick-next','quick-multi','quick-multi-next','quick-hover','quick-blur','palette']){
  const before=read(theme,'before',suffix),after=read(theme,'candidate',suffix);if(suffix==='quick-blur'){assert.equal(before.quickRows.length,0);assert.equal(after.quickRows.length,0);data.quick.push({case:suffix,closedOnBlur:true});continue;}assert(after.quickRows.length>=(suffix==='palette'?1:2));
  for(const row of after.quickRows){const focused=row.classes.includes('focused'),original=before.quickRows.find(r=>r.classes.includes('focused')===focused&&r.style.background===row.style.background);assert(original);equal(row.style,original.style);
   for(const label of row.labels){assert.equal(label.style.color,row.style.color);for(const p of label.parts.filter(p=>p.classes.includes('highlight'))){assert.equal(p.style.color,yellow);assert.equal(p.style.fontWeight,'700');}}
  }
  data.quick.push({case:suffix,rows:after.quickRows.length,focusedIndex:after.quickRows.findIndex(r=>r.classes.includes('focused')),matchedParts:after.quickRows[0].labels[0].parts.length});
 }
 assert.notEqual(data.quick[0].focusedIndex,data.quick[1].focusedIndex,'Keyboard navigation not exercised');assert(data.quick[2].matchedParts>1,'Multiple ranges missing');
 for(const lang of ['ts','js','html'])for(const state of ['clean','find','next',...(lang==='ts'?['selection']:[])]){
  const suffix=state==='selection'?'ts-selection':lang+'-'+state,before=read(theme,'before',suffix),after=read(theme,'candidate',suffix);
  const a=before.lines.filter(l=>l.text.trim()),b=after.lines.filter(l=>l.text.trim());equal(a.map(l=>l.text),b.map(l=>l.text));
  let matched=0,unchanged=0;
  for(let line=0;line<a.length;line++){
   const chars=l=>l.parts.flatMap(p=>[...p.text].map(char=>({char,style:p.style})));const x=chars(a[line]),y=chars(b[line]);equal(x.map(c=>c.char),y.map(c=>c.char));
   for(let col=0;col<x.length;col++){
    const positionMatch=state!=='clean'&&[...a[line].text.matchAll(/contrast/g)].some(m=>col>=m.index&&col<m.index+8);
    if(positionMatch){assert.equal(y[col].style.color,yellow);equal(y[col].style.fontStyle,x[col].style.fontStyle);equal(y[col].style.fontWeight,x[col].style.fontWeight);matched++;}
    else {equal(y[col].style,x[col].style);unchanged++;}
   }
  }
  if(state!=='clean'){
   assert(after.matches.some(m=>m.classes.includes('currentFindMatchInline')),'Current occurrence not rendered');assert(after.matches.some(m=>!m.classes.includes('currentFindMatchInline')),'Other occurrences missing');
   const set=s=>[...new Set(s.boxes.map(b=>JSON.stringify({classes:b.classes,style:b.style})))].sort();equal(set(after),set(before));
   const current=after.boxes.find(b=>b.classes.includes('currentFindMatch'));const other=after.boxes.find(b=>!b.classes.includes('currentFindMatch'));assert(current.style.border!==other.style.border,'Current occurrence lost distinction');
  }
  data.editor.push({case:suffix,matchedCharacters:matched,unchangedCharacters:unchanged});
 }
 for(const suffix of ['chat','chat-next']){
  const before=read(theme,'before',suffix),after=read(theme,'candidate',suffix);
  for(const name of ['chat-find-current-match','chat-find-other-match']){
   const a=before.chat[name],b=after.chat[name];assert(a.length&&b.length,'Chat matches absent');equal(a.map(r=>r.text),b.map(r=>r.text));
   for(let i=0;i<b.length;i++){assert.equal(b[i].style.color,yellow);equal(a[i].style.background,b[i].style.background);const bg=background(b[i]);const contrast=ratio(yellow,bg);assert(contrast>=4.5,'Shared chat foreground contrast below reference');data.chat.push({case:suffix,type:name,contrast,background:bg.slice(0,3)});}
  }
 }
 const s=read(theme,'before','search'),t=read(theme,'candidate','search');equal(s.search.map(e=>({text:e.text,style:e.style})),t.search.map(e=>({text:e.text,style:e.style})));
 const shortcuts=read(theme,'candidate','shortcuts');assert(shortcuts.shortcuts.length);const oldShortcuts=read(theme,'before','shortcuts');equal(oldShortcuts.shortcuts.map(e=>({text:e.text,style:e.style})),shortcuts.shortcuts.map(e=>({text:e.text,style:e.style})));for(const e of shortcuts.shortcuts){const contrast=ratio(e.style.color,background(e));data.shortcuts.push({text:e.text,contrast,unchangedInSample:true});}
 const inspectorBefore=read(theme,'before','inspector'),inspectorAfter=read(theme,'candidate','inspector');
 assert.equal(inspectorBefore.length,1);assert.equal(inspectorAfter.length,1);
 equal(inspectorBefore[0].text,inspectorAfter[0].text);
 assert(inspectorAfter[0].text.includes('semantic token type\tvariable'));
 assert(inspectorAfter[0].text.includes('modifiers\tdeclaration readonly'));
 data.semanticInspector={identical:true,type:'variable',modifiers:['declaration','readonly'],sample:'contrastValue',language:'typescript'};
 const pixels=JSON.parse(fs.readFileSync(path.join(dir,theme+'-selection-background-pixels.json')));
 assert(pixels.length);data.overlappingSelection={minimumContrast:Math.min(...pixels.map(p=>p.contrast)),evidence:theme+'-selection-background-pixels.json'};
 if(data.overlappingSelection.minimumContrast<4.5){const approval=require('./contrast-exception.json');assert.equal(theme,'monomin');assert.equal(approval.approved,true);data.overlappingSelection.status='Below 4.5:1; explicit user exception, not WCAG pass';}
 else data.overlappingSelection.status='At least 4.5:1 in measured sample';
 result.push(data);
}
fs.writeFileSync(path.join(__dirname,'visual-comparison.json'),JSON.stringify(result,null,2)+'\n');console.log(result.map(r=>({theme:r.theme,quick:r.quick,editorCases:r.editor.length,chatContrast:r.chat.map(c=>c.contrast.toFixed(2)),shortcuts:r.shortcuts})));
