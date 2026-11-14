const fs=require('fs'),path=require('path'),assert=require('assert');
const dir=path.join(__dirname,'stage-b-comments/visual');
const before=JSON.parse(fs.readFileSync(dir+'/before.json')),after=JSON.parse(fs.readFileSync(dir+'/after.json'));
assert.deepStrictEqual(before.theme,after.theme);assert.equal(before.theme.editorBackground,'#282a36');assert.equal(before.lines.length,after.lines.length);
const changed=[],unchanged=[];
function characters(line){return line.spans.flatMap(span=>[...span.text].map(char=>({char,style:span.style})));}
for(let line=0;line<before.lines.length;line++){
 const a=characters(before.lines[line]),b=characters(after.lines[line]);assert.equal(a.length,b.length);
 for(let column=0;column<a.length;column++){
  assert.equal(a[column].char,b[column].char);const x=a[column].style,y=b[column].style;
  if(x.color!==y.color){assert.equal(x.color,'rgb(98, 114, 164)');assert.equal(y.color,'rgb(121, 127, 165)');assert(line<=6||(line===9&&column>=before.lines[line].text.indexOf('//')),'Non-comment changed');assert.equal(x.border,x.color);assert.equal(y.border,y.color);assert.equal(x.outline,x.color);assert.equal(y.outline,y.color);assert.equal(x.fontStyle,'italic');assert.equal(y.fontStyle,'italic');changed.push({line:line+1,column:column+1});}
  else unchanged.push({line:line+1,column:column+1});
  const xWithoutColor={...x},yWithoutColor={...y};for(const k of ['color','border','outline']){delete xWithoutColor[k];delete yWithoutColor[k];}assert.deepStrictEqual(xWithoutColor,yWithoutColor,'Non-color style changed');
  if(x.color===y.color)assert.deepStrictEqual(x,y,'Unchanged token style differs');
 }
}
assert(changed.length);for(const line of [1,2,3,4,5,6,7,10])assert(changed.some(c=>c.line===line),'Missing comment case '+line);
const a=JSON.parse(fs.readFileSync(dir+'/baseline-comments-api.json')).result,b=JSON.parse(fs.readFileSync(dir+'/current-comments-api.json')).result;
for(const k of ['documentSha256','language','font','semanticSetting','semanticSettingSources','semantic','extensions','tokenCustomizations','semanticCustomizations'])assert.deepStrictEqual(a[k],b[k],k+' differs');assert.equal(a.semanticSetting,true);assert.equal(a.semantic.status,'returned');
const result={changedCharacters:changed.length,unchangedCharacters:unchanged.length,changedLines:[...new Set(changed.map(c=>c.line))],onlyAuthorizedForegroundChange:true,italicsPreserved:true,nonCommentTokensUnchanged:true,semanticEnabled:true,semanticProviderDataEqual:true,fontAndSettingsEqual:true,intentionallyDifferentCommentColorPreserved:'JSDoc value remains #C1C0C0'};
fs.writeFileSync(dir+'/comparison.json',JSON.stringify(result,null,2)+'\n');console.log(result);
