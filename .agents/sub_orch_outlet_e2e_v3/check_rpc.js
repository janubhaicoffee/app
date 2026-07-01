const fs = require('fs');
const https = require('https');

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const [k, v] = l.split('=');
  if (k && v) a[k.trim()] = v.trim().replace(/^"|"$/g, '');
  return a;
}, {});

https.get(
  env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/',
  {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
    },
  },
  (res) => {
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => {
      try {
        const json = JSON.parse(d);
        const p = Object.keys(json.paths);
        console.log("RPC paths:", p.filter((x) => x.startsWith('/rpc')));
      } catch (e) {
        console.error("Failed to parse JSON:", e.message);
      }
    });
  }
).on('error', (err) => {
  console.error("Error:", err.message);
});
