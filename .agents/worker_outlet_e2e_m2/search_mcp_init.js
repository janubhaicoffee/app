const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist/chunk-P2KUVMMH.cjs');
const content = fs.readFileSync(file, 'utf8');

const regex = /new\s+[a-zA-Z0-9_$]+\s*\(/g;
// Let's search for keywords: 'apiKey', 'accessToken', 'url', 'service', 'database'
const keywords = ['apiKey', 'accessToken', 'headers', 'supabase', 'database', 'pg'];
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (keywords.some(k => line.includes(k)) && (line.includes('class ') || line.includes('function ') || line.includes('const ') || line.includes('let '))) {
    if (line.length < 500) {
      console.log(`L${idx+1}: ${line.trim()}`);
    }
  }
});
