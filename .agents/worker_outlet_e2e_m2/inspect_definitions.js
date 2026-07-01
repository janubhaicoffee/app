const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envVars = fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const url = `${supabaseUrl}/rest/v1/`;

const options = {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Definitions:");
      console.log(Object.keys(json.definitions || {}));
      
      console.log("Details of rls_auto_enable parameter schema:");
      // Look under paths -> /rpc/rls_auto_enable -> post -> parameters -> schema
      const post = json.paths['/rpc/rls_auto_enable']?.post;
      if (post && post.parameters) {
        console.log(JSON.stringify(post.parameters, null, 2));
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
