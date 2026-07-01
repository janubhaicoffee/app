const fs = require('fs');
const path = require('path');
const os = require('os');

function search(dir, depth = 0) {
  if (depth > 4) return;
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
        if (file === 'node_modules' || file === '.git' || file === 'AppData/Local/Packages') continue;
        search(full, depth + 1);
      } else {
        if (file.includes('access-token') || file.includes('token') || file === 'credentials') {
          console.log('Found file:', full, '(size:', stat.size, ')');
        }
      }
    }
  } catch (e) {}
}

console.log('Searching in .config:');
search(path.join(os.homedir(), '.config'));
console.log('Searching in .supabase:');
search(path.join(os.homedir(), '.supabase'));
console.log('Searching in AppData/Roaming/supabase:');
search(path.join(os.homedir(), 'AppData', 'Roaming', 'supabase'));
console.log('Searching in AppData/Local/supabase:');
search(path.join(os.homedir(), 'AppData', 'Local', 'supabase'));
