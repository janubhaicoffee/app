const fs = require('fs');
const path = require('path');

function searchFiles(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchFiles(filePath, query);
    } else if (filePath.endsWith('.css') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(query)) {
        console.log(`Found "${query}" in: ${filePath}`);
      }
    }
  }
}

searchFiles(path.join(__dirname, '../src'), 'trust-item');
searchFiles(path.join(__dirname, '../src'), 'trust-bar');
