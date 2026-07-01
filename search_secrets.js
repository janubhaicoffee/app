const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (fs.existsSync(dir)) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
          results = results.concat(walk(fullPath));
        }
      } else {
        results.push(fullPath);
      }
    });
  }
  return results;
}

const files = walk('.');
files.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.local') || file.endsWith('.md')) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.toLowerCase().includes('password') || content.toLowerCase().includes('postgres') || content.toLowerCase().includes('conn')) {
      console.log(`Found keyword in: ${file}`);
    }
  }
});
