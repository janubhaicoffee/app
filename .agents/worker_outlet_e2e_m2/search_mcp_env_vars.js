const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist');
const files = [
  path.join(dir, 'transports/stdio.cjs'),
  path.join(dir, 'transports/stdio.js')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /process\.env\.([a-zA-Z0-9_]+)/g;
    let match;
    console.log(`File: ${path.relative(dir, file)}`);
    while ((match = regex.exec(content)) !== null) {
      console.log(`  Found env var: ${match[1]}`);
    }
  }
});
