// Execute the existing engine/grammar regression unchanged, directing artifacts here.
const fs=require('fs'),path=require('path'),vm=require('vm'),{createRequire}=require('module');
const source=path.resolve(__dirname,'../tokens.cjs');
if(!process.argv[2]||process.argv[2].startsWith('--'))process.argv.splice(2,0,require('./baseline.json').app);
vm.runInThisContext('(function(require,__dirname){'+fs.readFileSync(source,'utf8')+'\n})',{filename:source})(createRequire(source),__dirname);
