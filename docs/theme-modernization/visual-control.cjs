const fs=require('fs'),path=require('path');
const [root,action,label]=process.argv.slice(2);
(async()=>{for(const side of ['baseline','current']){const dir=path.join(root,side,'live'),id=Date.now()+'-'+side;
 fs.writeFileSync(path.join(dir,'request.json'),JSON.stringify({id,action}));let result;
 for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,250));if(fs.existsSync(path.join(dir,'response.json'))){const r=JSON.parse(fs.readFileSync(path.join(dir,'response.json')));if(r.id===id){result=r;break;}}}
 if(!result||result.error)throw Error(JSON.stringify(result||{timeout:true}));
 if(label)fs.writeFileSync(path.join(process.env.THEME_VISUAL_EVIDENCE||path.join(__dirname,'visual-evidence'),side+'-'+label+'-api.json'),JSON.stringify(result,null,2));console.log(side,action,'done');
}})().catch(e=>{console.error(e);process.exitCode=1;});
