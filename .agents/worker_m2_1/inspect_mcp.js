const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('execute_sql')) {
      console.log(`Found 'execute_sql' in ${file}`);
      // Find the surrounding context
      const index = content.indexOf('execute_sql');
      console.log(content.substring(index - 200, index + 800));
    }
  }
}
