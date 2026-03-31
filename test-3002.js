const http = require('http');

http.get('http://127.0.0.1:3002/api/inventory', (res) => {
  let data = '';
  console.log('Status Code:', res.statusCode);
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Success! Body Length:', data.length);
    console.log('First 100 chars:', data.trim().substring(0, 100));
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
