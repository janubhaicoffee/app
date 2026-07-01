const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
console.log('APPDATA:', appData);

const dirs = [
  path.join(appData, 'Cursor'),
  path.join(appData, 'Cursor', 'User'),
  path.join(appData, 'Code'),
  path.join(appData, 'Code', 'User'),
  path.join(appData, 'Cursor-Previews'),
  path.join(appData, 'Cursor-Previews', 'User'),
  path.join(appData, 'antigravity')
];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Directory exists: ${dir}`);
    try {
      const files = fs.readdirSync(dir);
      console.log(`  Files:`, files.filter(f => !fs.statSync(path.join(dir, f)).isDirectory()));
    } catch (e) {
      console.log(`  Error:`, e.message);
    }
  } else {
    console.log(`Directory does NOT exist: ${dir}`);
  }
});
