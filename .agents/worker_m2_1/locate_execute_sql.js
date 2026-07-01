const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../node_modules/@supabase/mcp-server-supabase/dist');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const searchPatterns = ['executeSql:', 'executeSql(', 'executeSql ='];
    for (const pat of searchPatterns) {
      let index = 0;
      while (true) {
        index = content.indexOf(pat, index);
        if (index === -1) break;
        console.log(`Found ${pat} in ${file} at ${index}`);
        console.log(content.substring(index - 100, index + 300));
        index += pat.length;
      }
    }
  }
}
