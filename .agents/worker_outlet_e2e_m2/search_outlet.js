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
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.mjs')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const allFiles = walk(path.resolve(__dirname, '../../'));
console.log(`Found ${allFiles.length} files to search.`);

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('outlet_')) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('outlet_')) {
        console.log(`${path.relative(path.resolve(__dirname, '../../'), file)}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
}
