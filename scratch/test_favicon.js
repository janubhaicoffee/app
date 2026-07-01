const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/favicon.ico',
  headers: {
    'Host': 'outlet.janubhai.com'
  }
};

http.get(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${data.slice(0, 100)}`);
  });
}).on('error', (err) => {
  console.error(`ERROR: ${err.message}`);
});
