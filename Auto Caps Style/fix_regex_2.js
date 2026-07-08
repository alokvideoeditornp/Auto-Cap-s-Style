const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  let lines = content.split('\\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('replace(/[.,!?;')) {
      let idx = lines[i].indexOf('replace(/[.,!?;');
      if (idx !== -1) {
         let endIdx = lines[i].indexOf('/g', idx);
         if (endIdx !== -1) {
            let oldRegex = lines[i].substring(idx + 8, endIdx + 2);
            lines[i] = lines[i].replace(oldRegex, "/[.,!?;:\\\"\\'(){}[\\\\]\\\\-।॥]/g");
            changed = true;
         }
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(f, lines.join('\\n'), 'utf8');
    count++;
    console.log('Updated', f);
  }
});
console.log('Done', count);
