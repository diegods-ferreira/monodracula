const fs=require('fs'),{rgb,hex,ratio,over,lum}=require('../dark-modern-comparison/color.cjs'),session=require('../dark-modern-comparison/session.json'),ts=require(session.app+'/extensions/node_modules/typescript/lib/typescript.js');
const bright=(v,k=1.1)=>rgb(v).slice(0,3).map(x=>Math.min(255,x*k)).concat(1),mix=(a,b,t)=>hex(rgb(a).slice(0,3).map((x,i)=>x*(1-t)+rgb(b)[i]*t).concat(1));
const button=(fg,bg,hover,error,editor)=>({foreground:fg,background:bg,hoverBackground:hover,errorForeground:error,send:ratio(fg,error),sendHover:ratio(bright(fg),bright(error)),native:ratio(fg,bg),nativeHover:ratio(fg,hover),errorOnEditor:ratio(error,editor)});
const result={method:'Quantitative prescreen only. Runtime validation and visual judgment still required.',themes:{}};
for(const n of ['MonoMin','MonoDracula']){
 const theme=ts.parseConfigFileTextToJson('',fs.readFileSync('themes/'+n+'Theme.json','utf8')).config,c=theme.colors,error=c.errorForeground,editor=c['editor.background'],conversation=c['sideBar.background'];
 const muted=n==='MonoMin'?button('#101010','#808080','#888888',error,editor):button('#14141b','#797fa5',mix('#797fa5','#fcfcfa',.12),error,editor);
 const errorSearch=[];for(const fg of [c.foreground,...(n==='MonoMin'?['#ededed','#f0f0f0']:[])])for(let factor=.78;factor<=.99;factor+=.001){const e=hex(rgb(error).slice(0,3).map(x=>x*factor).concat(1)),v=button(fg,c['button.background'],c['button.hoverBackground'],e,editor);if(Math.min(v.send,v.sendHover)>=3&&Math.min(v.native,v.nativeHover,v.errorOnEditor)>=4.5)errorSearch.push({...v,factor});}
 errorSearch.sort((a,b)=>Number(b.foreground.toLowerCase()===c.foreground.toLowerCase())-Number(a.foreground.toLowerCase()===c.foreground.toLowerCase())||b.factor-a.factor);
 const prior=require('../dark-modern-comparison/evidence/'+n.toLowerCase()+'-code.json'),parts=prior.blocks[2].code.parts,code=[];
 const backgrounds=n==='MonoMin'?['#151515','#171717','#191919','#1b1b1b','#1f1f1f','#00000066','#00000099']:['#21222c','#232430','#252633','#282a36','#14141b','#00000040'];
 for(const value of backgrounds){const bg=over(value,conversation),tokens=parts.map(p=>({text:p.text,foreground:p.style.color,contrast:ratio(p.style.color,bg)})),base=Math.min(...parts.map(p=>ratio(p.style.color,c['textCodeBlock.background'])));code.push({value,effective:hex(bg),surface:ratio(bg,conversation),text:ratio(c.foreground,bg),minimum:Math.min(...tokens.map(t=>t.contrast)),baselineMinimum:base,relativeMinimumChange:Math.min(...tokens.map(t=>t.contrast))/base-1,tokens});}
 result.themes[n]={mutedButton:muted,errorSearchCount:errorSearch.length,bestErrorCandidate:errorSearch[0]??null,code};
}
fs.writeFileSync(__dirname+'/screening.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(Object.fromEntries(Object.entries(result.themes).map(([n,t])=>[n,{muted:t.mutedButton,errorCandidates:t.errorSearchCount,bestError:t.bestErrorCandidate,code:t.code.map(({tokens,...r})=>r)}])),null,2));
