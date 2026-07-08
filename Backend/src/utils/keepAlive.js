const http = require('http');
const https = require('https');

function startKeepAlive() {
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (!selfUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.log('Keep-alive: RENDER_EXTERNAL_URL is not set. Skipping ping.');
    }
    return;
  }

  const healthUrl = `${selfUrl.replace(/\/$/, '')}/health`;
  console.log(`Keep-alive ping initialized for target: ${healthUrl}`);
  
  // Ping every 14 minutes (14 * 60 * 1000 ms)
  const interval = 14 * 60 * 1000;
  
  setInterval(() => {
    const client = healthUrl.startsWith('https') ? https : http;
    
    client.get(healthUrl, (res) => {
      console.log(`Keep-alive ping sent to ${healthUrl}. Response status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Keep-alive ping failed: ${err.message}`);
    });
  }, interval);
}

module.exports = { startKeepAlive };
