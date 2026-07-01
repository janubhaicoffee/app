const fs = require('fs');
const file = 'C:\\Users\\hudav\\.bsync_core\\app\\mcp-secret-env.json';
if (fs.existsSync(file)) {
  console.log('Secret file exists.');
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    console.log('Keys:');
    for (const key of Object.keys(data)) {
      console.log(key, ':', String(data[key]).slice(0, 15) + '...');
    }
  } catch (e) {
    console.log('Error parsing:', e.message);
  }
} else {
  console.log('Secret file does not exist:', file);
}
