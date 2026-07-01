const https = require('https');

const token = 'sbp_oauth_0fb68fafc8f4485891f5f5b91ee0f3a8a206f5cd';
const projectRef = 'fheddjuiedseynqxhsfb';

const data = JSON.stringify({
  query: 'SELECT 1 as test_val;'
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  console.log('Status:', res.statusCode);
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Body:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
