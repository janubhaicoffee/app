const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} -> ${destPath}`);
    }
  }
}

// 1. Copy operations -> admin/operations
copyDir('src/app/operations', 'src/app/admin/operations');

// 2. Copy growth -> admin/growth
copyDir('src/app/growth', 'src/app/admin/growth');

// 3. Copy manager -> admin/manager
copyDir('src/app/manager', 'src/app/admin/manager');

console.log('Migration of files complete.');
