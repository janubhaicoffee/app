const fs = require('fs');
const path = require('path');

console.log("Env keys:", Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SECRET') || k.includes('KEY') || k.includes('URL')));

const envFile = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  console.log(".env.local keys:", content.split('\n').map(l => l.split('=')[0].trim()).filter(Boolean));
} else {
  console.log(".env.local not found at", envFile);
}
