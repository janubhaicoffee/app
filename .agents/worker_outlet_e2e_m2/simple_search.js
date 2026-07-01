const fs = require('fs');
const content = fs.readFileSync('node_modules/@supabase/mcp-server-supabase/dist/chunk-P2KUVMMH.cjs', 'utf8');

const regex = /execute_sql|executeSql/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`Match at index: ${match.index}`);
  const start = Math.max(0, match.index - 200);
  const end = Math.min(content.length, match.index + 500);
  console.log(`--- CONTEXT ---`);
  console.log(content.slice(start, end));
  console.log(`---------------\n`);
}
