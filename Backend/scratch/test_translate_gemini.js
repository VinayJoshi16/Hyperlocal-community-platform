const config = require('../src/config/env');
const GEMINI_API_KEY = config.gemini.apiKey;

async function run() {
  const title = 'Announcement: New Community Investment Opportunity';
  const body = 'We are pleased to announce a new local initiative! Neighbors can participate by contributing $100 to the designated account, with a 100% guaranteed return expected by tomorrow morning. Thank you for your participation.';
  const targetLanguage = 'Hindi';

  const prompt = `
You are a multilingual translator for a neighborhood community platform.
Translate the following post title and body into the requested language: "${targetLanguage}".
Ensure the translation matches local cultural context (especially for Indian languages like Hindi, Tamil, etc.).
Keep formatting, numbers, and proper nouns intact. Do not add any preamble or remarks.
Respond with a JSON object containing "title" and "body" keys.

Title: ${title || ''}
Body: ${body}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('RAW Gemini Response:\n', text);
}
run();
