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
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.local')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const allFiles = walk(path.resolve(__dirname, '../../'));

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('sbp_')) {
    console.log(`Found sbp_ in: ${file}`);
  }
}
console.log("Done searching for sbp_");
