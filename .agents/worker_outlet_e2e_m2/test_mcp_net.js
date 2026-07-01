const https = require('https');

https.get('https://mcp.supabase.com/mcp', (res) => {
  console.log('Status code:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
}).on('error', (e) => {
  console.error('Error connecting:', e.message);
});
