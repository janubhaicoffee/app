const fs = require('fs');

const file = 'tests/outlet_dashboard.spec.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('page.route')) {
    console.log(`L${idx+1}: ${line.trim()}`);
    for (let i = 1; i <= 15; i++) {
      if (lines[idx + i]) {
        console.log(`  +${i}: ${lines[idx + i]}`);
      }
    }
  }
});
