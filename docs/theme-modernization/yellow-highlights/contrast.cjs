const fs=require('fs'),path=require('path');const out=__dirname;
const rgb=v=>{if(v.startsWith('#'))return[0,2,4].map(i=>parseInt(v.slice(1+i,3+i),16)).concat(1);const n=v.match(/[\d.]+/g).map(Number);return n.slice(0,3).concat(n[3]??1);};
const over=(f,b)=>{f=typeof f==='string'?rgb(f):f;b=typeof b==='string'?rgb(b):b;return f.slice(0,3).map((c,i)=>c*f[3]+b[i]*(1-f[3])).concat(1);};
const lum=v=>(typeof v==='string'?rgb(v):v).slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
const ratio=(f,b)=>{const a=lum(f),c=lum(b);return(Math.max(a,c)+.05)/(Math.min(a,c)+.05);};
const results=[];for(const theme of ['monomin','monodracula']){
 const s=JSON.parse(fs.readFileSync(out+'/evidence/'+theme+'-surfaces.json')),q=JSON.parse(fs.readFileSync(out+'/evidence/'+theme+'-candidate-quick.json')),yellow=theme==='monomin'?'#F8C66B':'#f1fa8c';
 const quick=q.quickRows.map(r=>({focused:r.classes.includes('focused'),background:over(r.style.background,s['quickInput.background']),ratio:ratio(yellow,over(r.style.background,s['quickInput.background']))}));
 const editor=['editor.findMatchBackground','editor.findMatchHighlightBackground'].map(k=>({kind:k,background:over(s[k],s['editor.background']),ratio:ratio(yellow,over(s[k],s['editor.background']))}));
 results.push({theme,yellow,quick,editor});
}
fs.writeFileSync(out+'/contrast.json',JSON.stringify(results,null,2)+'\n');console.log(results.map(r=>({theme:r.theme,quick:r.quick.map(q=>q.ratio.toFixed(2)),editor:r.editor.map(e=>e.ratio.toFixed(2))})));
