require('dotenv').config();
const key = process.env.GEMINI_API_KEY;

async function test(version, model) {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
  console.log(`\nTesting: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });
    const status = res.status;
    const text = await res.text();
    console.log(`-> Status: ${status}`);
    if (status === 200) {
      console.log(`-> Success!`);
    } else {
      console.log(`-> Error: ${text.substring(0, 300)}`);
    }
  } catch (err) {
    console.log(`-> Exception: ${err.message}`);
  }
}

async function run() {
  console.log('\n--- Testing Raw Output ---');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;
  const prompt = `
You are a helpful assistant rewriting a post for a hyperlocal neighborhood platform.
Improve the following post to make it clear, well-structured, and matching the requested tone for post type: "lost_found".
Keep the length similar. Do not change factual details like dates, addresses, phone numbers, or item names.
Respond with a JSON object containing "title" and "body" keys.

Title: help lost dog
Body: i lost my black lab labrador puppy near park street yesterday around 4pm. he was wearing a blue collar. please help me find him
`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Raw text:', JSON.stringify(text));
  } catch (err) {
    console.log(`Exception: ${err.message}`);
  }
}
run();
