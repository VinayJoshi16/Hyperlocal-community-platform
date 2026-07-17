const jwt = require('jsonwebtoken');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const userId = '2c45da88-ce8a-4d9b-bdb5-c6ae30f8688d';
const email = 'vjvinayjoshi756@gmail.com';
const secretKey = process.env.JWT_SECRET;

const token = jwt.sign({ id: userId, email }, secretKey, { expiresIn: '7d' });

console.log('SIGNED JWT TOKEN:', token);

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/circles/cca18cc4-a66e-4c9f-b810-f483b6bf7de0/messages',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Active-Location-Id': 'dummy-location-id'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('BODY RESPONSE:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  process.exit(1);
});

req.end();
