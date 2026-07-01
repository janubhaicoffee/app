const fs = require('fs');
const path = require('path');

function search(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const full = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git' || file === '.next') continue;
        search(full);
      } else {
        if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.txt')) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes('password') || content.includes('pass') || content.includes('SECRET') || content.includes('ROLE_KEY')) {
            console.log('Match in file:', full);
            // Print lines containing match
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes('password') || line.includes('pass') || line.includes('SECRET') || line.includes('ROLE_KEY')) {
                console.log(`  Line ${index + 1}: ${line.trim().slice(0, 100)}`);
              }
            });
          }
        }
      }
    }
  } catch (e) {}
}

search('.');
