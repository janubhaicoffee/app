const fs = require('fs');
const path = require('path');

function searchRefs(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchRefs(fullPath);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const regex = /['"`](\/(operations|growth|manager))['"`]/g;
        if (regex.test(line)) {
          if (!fullPath.includes('src\\app\\operations\\page.js') &&
              !fullPath.includes('src\\app\\growth\\page.js') &&
              !fullPath.includes('src\\app\\manager\\page.js')) {
            console.log(`${path.relative(process.cwd(), fullPath)}:${idx+1}: ${line.trim()}`);
          }
        }
      });
    }
  }
}

searchRefs('src');
