const fs = require('fs');
const content = fs.readFileSync('node_modules/@supabase/mcp-server-supabase/dist/chunk-5PS6HETH.js', 'utf-8');
const searchWords = ['headers', 'Authorization', 'apiKey', 'token', 'baseUrl'];
for (const word of searchWords) {
  let index = content.indexOf(word);
  while (index !== -1) {
    console.log(`Found '${word}' at index: ${index}`);
    console.log(content.slice(Math.max(0, index - 100), index + 200));
    index = content.indexOf(word, index + 1);
    if (index !== -1) {
      // only print first 2 occurrences of each word to keep output manageable
      index = content.indexOf(word, index + 1);
    }
  }
}
