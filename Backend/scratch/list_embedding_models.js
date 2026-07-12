const config = require('../src/config/env');
const GEMINI_API_KEY = config.gemini.apiKey;

async function listModels() {
  if (!GEMINI_API_KEY) {
    console.error('No GEMINI_API_KEY set.');
    return;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('Available models:');
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes('embedContent')) {
        console.log(`- ${m.name} (supports embedContent)`);
      } else {
        console.log(`- ${m.name}`);
      }
    });
  } catch (err) {
    console.error('Failed to list models:', err.message);
  }
}
listModels();
