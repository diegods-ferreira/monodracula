// Compares provider/config evidence only; rendering must be signed off separately.
const fs=require('fs'),assert=require('assert');
const [a,b]=process.argv.slice(2);assert(a&&b,'Usage: node compare-captures.cjs baseline.json current.json');
const left=JSON.parse(fs.readFileSync(a)),right=JSON.parse(fs.readFileSync(b));
const fields=['label','version','language','file','documentSha256','dirty','theme','semanticSetting','semanticSettingSources','tokenCustomizations','semanticCustomizations','font','extensions','semantic'];
const differing=fields.filter(k=>{try{assert.deepStrictEqual(left[k],right[k]);return false;}catch{return true;}});
const inconclusive=left.dirty||right.dirty||left.semantic?.status!=='returned'||right.semantic?.status!=='returned';
console.log(JSON.stringify({differing,inconclusive,providerEvidenceEqual:!inconclusive&&!differing.length,rendering:'Requires Inspect Editor Tokens and Scopes and matched screenshots; not validated by this script.'},null,2));
if(differing.length||inconclusive)process.exitCode=1;
