const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/page.css');
const content = fs.readFileSync(cssPath, 'utf8');

let openBraces = 0;
let closeBraces = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const o = (line.match(/\{/g) || []).length;
  const c = (line.match(/\}/g) || []).length;
  openBraces += o;
  closeBraces += c;
}

console.log(`Open braces: ${openBraces}`);
console.log(`Close braces: ${closeBraces}`);
if (openBraces !== closeBraces) {
  console.error("Mismatch in braces count!");
} else {
  console.log("Braces count matches.");
}
