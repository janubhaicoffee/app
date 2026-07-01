const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk('.');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('.rpc(')) {
    console.log(`Found .rpc( in: ${file}`);
    // Print the line containing .rpc(
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('.rpc(')) {
        console.log(`  Line ${idx+1}: ${line.trim()}`);
      }
    });
  }
});
