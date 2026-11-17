const assert=require('assert');
function rgb(v){if(v.startsWith('#')){let s=v.slice(1);if(s.length===3||s.length===4)s=[...s].map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)).concat(s.length===8?parseInt(s.slice(6),16)/255:1);}if(v.startsWith('color(srgb')){const n=v.match(/[\d.]+/g).map(Number);return n.slice(0,3).map(v=>v*255).concat(n[3]??1);}const n=v.match(/[\d.]+/g)?.map(Number);assert(n?.length>=3,'Unknown color '+v);return n.slice(0,3).concat(n[3]??1);}
const over=(a,b,opacity=1)=>{a=typeof a==='string'?rgb(a):a;b=typeof b==='string'?rgb(b):b;const t=a[3]*opacity;return a.slice(0,3).map((x,i)=>x*t+b[i]*(1-t)).concat(1);};
const lum=a=>(typeof a==='string'?rgb(a):a).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const hex=a=>'#'+(typeof a==='string'?rgb(a):a).slice(0,3).map(x=>Math.round(Math.min(255,Math.max(0,x))).toString(16).padStart(2,'0')).join('');
module.exports={rgb,over,lum,ratio,hex};
