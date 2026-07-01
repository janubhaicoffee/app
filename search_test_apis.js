const fs = require('fs');
const content = fs.readFileSync('tests/outlet_dashboard.spec.js', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('api/') || line.includes('api/outlet') || line.includes('api/integrations')) {
    console.log(`Line ${idx+1}: ${line.trim().slice(0, 100)}`);
  }
});
