const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        walk(fullPath, files);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const dir = path.resolve(__dirname, '../../src');
const allFiles = walk(dir);

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('.rpc')) {
    console.log(`.rpc in: ${path.relative(dir, file)}`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('.rpc')) {
        console.log(`  L${idx+1}: ${line.trim()}`);
      }
    });
  }
}
