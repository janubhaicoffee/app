const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else {
      if (file.endsWith('.js') || file.endsWith('.cjs')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const dir = path.resolve(__dirname, '../../node_modules/@supabase/mcp-server-supabase');
const allFiles = walk(dir);

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('execute_sql')) {
    console.log(`Found 'execute_sql' in ${path.relative(dir, file)}`);
    // Find surrounding context
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('execute_sql')) {
        console.log(`  L${idx+1}: ${line.trim().slice(0, 150)}`);
      }
    });
  }
}
