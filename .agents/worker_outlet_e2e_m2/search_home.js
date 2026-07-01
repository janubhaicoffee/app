const fs = require('fs');
const path = require('path');

const home = 'C:\\Users\\hudav';

function checkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.toLowerCase().includes('supabase')) {
        console.log(`Found supabase folder/file: ${path.join(dir, f)}`);
      }
    }
  } catch (e) {
    // Ignore
  }
}

checkDir(home);
checkDir(path.join(home, '.config'));
checkDir(path.join(home, '.config', 'supabase'));
checkDir(path.join(home, 'AppData', 'Roaming'));
checkDir(path.join(home, 'AppData', 'Local'));
