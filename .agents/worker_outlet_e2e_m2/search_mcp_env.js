const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules') {
        walk(fullPath, files);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.cjs')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const dir = path.resolve(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist');
const allFiles = walk(dir);

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('process.env')) {
    console.log(`Found in: ${path.relative(dir, file)}`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('process.env')) {
        console.log(`  L${idx+1}: ${line.trim().slice(0, 150)}`);
      }
    });
  }
}
