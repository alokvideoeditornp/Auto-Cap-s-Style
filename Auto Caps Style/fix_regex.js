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
  if (content.includes("/[.,!?;:\\\"\\'(){}[\\\\]\\\\-]/g")) {
    console.log('Found in', f);
    count++;
    // Let's replace it with the better regex that also supports Hindi Danda
    content = content.replace(/\/\[\.,!\?;:\\"\\'\(\)\{\}\[\\\\\]\\\\-\]\/g/g, "/[.,!?;:\\\"\\'(){}[\\\\]\\\\-।॥]/g");
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated', f);
  }
});
console.log('Done', count);
