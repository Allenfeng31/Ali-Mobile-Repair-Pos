const http = require('http');

http.get('http://localhost:3001/api/inventory', (res) => {
  let data = '';
  console.log('Status Code:', res.statusCode);
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Body Preview (500 chars):', data.substring(0, 500));
    console.log('Body Length:', data.length);
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
