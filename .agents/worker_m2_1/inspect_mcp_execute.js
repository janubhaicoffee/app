const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist/chunk-ZMTRWYWC.js');
const content = fs.readFileSync(filePath, 'utf8');

const searchStr = 'executeSql';
let index = 0;
while (true) {
  index = content.indexOf(searchStr, index);
  if (index === -1) break;
  console.log(`--- Match at ${index} ---`);
  console.log(content.substring(index - 100, index + 500));
  index += searchStr.length;
}
