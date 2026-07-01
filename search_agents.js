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
        search(full);
      } else {
        if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes('execute_sql') || content.includes('apply_migration') || content.includes('db query') || content.includes('create table') || content.includes('outlet_transactions')) {
            console.log('Match in file:', full);
            // Print lines containing match
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes('execute_sql') || line.includes('apply_migration') || line.includes('db query') || line.includes('create table') || line.includes('outlet_transactions')) {
                console.log(`  Line ${index + 1}: ${line.trim().slice(0, 120)}`);
              }
            });
          }
        }
      }
    }
  } catch (e) {}
}

search('.agents');
