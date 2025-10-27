const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'dist', 'spa');

console.log('---- dist/spa listing ----');
try {
  function walk(d, prefix = ''){
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for(const e of entries){
      const p = path.join(d, e.name);
      const rel = path.join(prefix, e.name);
      console.log(rel + (e.isDirectory() ? '/' : ''));
      if(e.isDirectory()) walk(p, rel);
    }
  }
  if(fs.existsSync(dir)){
    walk(dir);
  } else {
    console.log('dist/spa does not exist');
  }
} catch(err){
  console.error('Failed to list dist/spa:', err);
}
console.log('---- end listing ----');
