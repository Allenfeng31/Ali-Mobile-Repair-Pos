const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/inventory',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Body Preview (200 chars):', data.substring(0, 200));
    console.log('Total Length:', data.length);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();
