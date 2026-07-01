const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git') {
          walk(fullPath, files);
        }
      } else {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Ignore
  }
  return files;
}

const allFiles = walk('C:\\Users\\hudav\\.gemini\\antigravity');
console.log(`Found ${allFiles.length} files in gemini folder.`);
for (const file of allFiles) {
  if (file.toLowerCase().includes('pass') || file.toLowerCase().includes('key') || file.toLowerCase().includes('token') || file.toLowerCase().includes('config')) {
    console.log(`Matching file: ${file}`);
  }
}
