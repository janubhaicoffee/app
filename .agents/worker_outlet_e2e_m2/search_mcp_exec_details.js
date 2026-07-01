const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist/chunk-P2KUVMMH.cjs');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('execute_sql') || line.includes('executeSql')) {
    console.log(`L${idx+1}: ${line.trim().slice(0, 200)}`);
    // Print 30 lines after
    for (let i = 1; i <= 30; i++) {
      if (lines[idx + i]) {
        console.log(`  +${i}: ${lines[idx + i].trim().slice(0, 200)}`);
      }
    }
  }
});
