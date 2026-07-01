const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk('.');
for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('password') || content.includes('postgresql://') || content.includes('db.fheddjuiedseynqxhsfb.supabase.co')) {
      console.log(`Match in ${file}:`);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('password') || line.includes('postgresql://') || line.includes('db.fheddjuiedseynqxhsfb.supabase.co')) {
          console.log(`  L${idx+1}: ${line.trim().slice(0, 150)}`);
        }
      });
    }
  } catch (e) {}
}
console.log("Search complete.");
