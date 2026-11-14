const assert=require('assert');
const scopes=[['comment','comment keyword','comment markup.underline.link','comment string','comment punctuation.definition','comment punctuation','comment text'],'comment storage.type','punctuation.definition.comment'];
const indices=[0,1,90];
exports.indices=indices;
exports.assertTokens=(before,after,name)=>{
 const expected=structuredClone(before);assert.equal(expected.length,161);
 if(name==='MonoDracula')indices.forEach((index,i)=>{assert.deepStrictEqual(expected[index].scope,scopes[i]);assert.equal(expected[index].settings.foreground,'#6272a4');expected[index].settings.foreground='#797fa5';});
 assert.deepStrictEqual(after,expected,'Only the three approved comment foreground changes are allowed');
};
exports.expectedText=(text,ts)=>{
 const ast=ts.parseJsonText('theme.json',text);assert(!ast.parseDiagnostics.length);
 const root=ast.statements[0].expression;
 const rules=root.properties.find(p=>p.name.text==='tokenColors').initializer.elements;
 const replacements=indices.map(index=>{const settings=rules[index].properties.find(p=>p.name.text==='settings').initializer;const value=settings.properties.find(p=>p.name.text==='foreground').initializer;assert.equal(value.text,'#6272a4');return {start:value.getStart(ast),end:value.end};});
 for(const r of replacements.sort((a,b)=>b.start-a.start))text=text.slice(0,r.start)+'"#797fa5"'+text.slice(r.end);
 return text;
};
exports.compareResolved=(before,after,name)=>{
 let changed=0,unchanged=0;const changes=[];
 assert.deepStrictEqual(Object.keys(before),Object.keys(after));
 for(const scope of Object.keys(before)){
  const a=before[scope],b=after[scope];assert.equal(a.lines.length,b.lines.length);
  for(let line=0;line<a.lines.length;line++){
   const x=a.lines[line],y=b.lines[line];assert.equal(x.text,y.text);assert.deepStrictEqual(x.tokens,y.tokens);
   function meta(tokens,column){let value;for(let i=0;i<tokens.length;i+=2){if(tokens[i]>column)break;value=tokens[i+1];}assert(value!==undefined);return value;}
   for(let column=0;column<x.text.length;column++){
    const m=meta(x.metadata,column),n=meta(y.metadata,column),fg=a.colorMap[(m>>>15)&511],next=b.colorMap[(n>>>15)&511];
    assert.equal(m&0x7fff,n&0x7fff,'Language, token type and fontStyle changed');assert.equal(a.colorMap[(m>>>24)&255],b.colorMap[(n>>>24)&255]);
    if(fg===next){unchanged++;continue;}
    const stack=x.tokens.find(t=>t.startIndex<=column&&column<t.endIndex)?.scopes||[];
    assert(name==='MonoDracula'&&fg.toLowerCase()==='#6272a4'&&next.toLowerCase()==='#797fa5'&&stack.some(s=>s.startsWith('comment')||s.startsWith('punctuation.definition.comment')),'Unauthorized resolved token color change: '+JSON.stringify({scope,line,column,fg,next,stack}));
    changed++;if(!changes.some(c=>c.scope===scope&&c.line===line))changes.push({scope,line,from:fg,to:next,scopes:stack});
   }
  }
 }
 if(name==='MonoDracula')assert(changed>0,'No comment fixture changed');else assert.equal(changed,0);
 return {changedCharacters:changed,unchangedCharacters:unchanged,changes};
};
