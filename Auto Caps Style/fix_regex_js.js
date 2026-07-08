const fs = require('fs');

const files = [
  'src/remotion/CaptionLine.tsx', 
  'src/lib/srtParser.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Replace the corrupted string which has U+FFFD
  content = content.replace(/\[\.,!\?;:"'\(\)\{\}\[\\\]\\- \]/g, "[.,!?;:\"'(){}[\\\\]\\\\-।॥]");
  fs.writeFileSync(f, content, 'utf8');
  console.log(f + ' fixed');
});
