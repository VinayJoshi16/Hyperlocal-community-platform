const config = require('../config/env');

const GEMINI_API_KEY = config.gemini.apiKey;

/**
 * Generic helper to send requests to Gemini API
 */
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  // Robustly extract the outermost JSON object by matching braces, skipping strings and escapes
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error(`No opening brace found in response: "${text}"`);
  }

  let braceCount = 0;
  let inString = false;
  let escape = false;
  let jsonString = null;

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonString = text.substring(firstBrace, i + 1);
          break;
        }
      }
    }
  }

  if (!jsonString) {
    throw new Error(`No matching closing brace found in response: "${text}"`);
  }

  return JSON.parse(jsonString);
}

/**
 * AI Post Polish / Rewrite
 */
async function improvePost(title, body, type) {
  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Polishing post due to missing GEMINI_API_KEY');
    return {
      title: title ? `✨ [Polished] ${title}` : '',
      body: `${body}\n\n*(Note: This post was polished using AI Mock. Configure GEMINI_API_KEY for real AI suggestions.)*`
    };
  }

  const prompt = `
You are a helpful assistant rewriting a post for a hyperlocal neighborhood platform.
Improve the following post to make it clear, well-structured, and matching the requested tone for post type: "${type}".
Keep the length similar. Do not change factual details like dates, addresses, phone numbers, or item names.
Respond with a JSON object containing "title" and "body" keys.

Title: ${title || ''}
Body: ${body}
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error('Gemini call failed inside improvePost, falling back to mock:', err.message);
    return {
      title: title ? `✨ [Polished] ${title}` : '',
      body: `${body}\n\n*(AI Fallback applied: ${err.message})*`
    };
  }
}

/**
 * AI Content Moderation
 */
async function moderateContent(title, body) {
  const fullText = `${title || ''} ${body}`.toLowerCase();

  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Moderating content due to missing GEMINI_API_KEY');
    // Basic local spam/hate heuristics for manual testing
    const testBlockwords = ['spam-test-flag', 'hate-test-flag', 'kill-test-flag', 'scam-test-flag'];
    const matched = testBlockwords.find(word => fullText.includes(word));
    
    if (matched) {
      return {
        flagged: true,
        reason: `Flagged by local mock filter (contains test trigger word: "${matched}").`
      };
    }
    return { flagged: false, reason: null };
  }

  const prompt = `
You are a content safety moderator for a neighborhood community platform.
Evaluate the following post for spam, hate speech, severe insults, harassment, fake emergency alerts, scams, or illegal content.
Return a JSON object with keys "flagged" (boolean) and "reason" (string, explanation in 1 sentence if flagged, null otherwise).

Title: ${title || ''}
Body: ${body}
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error('Gemini call failed inside moderateContent, falling back to false:', err.message);
    return { flagged: false, reason: null };
  }
}

/**
 * Emergency Severity Classifier
 */
async function classifyEmergency(title, body) {
  const fullText = `${title || ''} ${body}`.toLowerCase();

  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Classifying emergency due to missing GEMINI_API_KEY');
    
    if (fullText.includes('fire') || fullText.includes('accident') || fullText.includes('injured') || fullText.includes('heart')) {
      return {
        severity: 'critical',
        rationale: 'Mock classified as critical: contains high-alert keywords.'
      };
    }
    if (fullText.includes('power') || fullText.includes('block') || fullText.includes('water') || fullText.includes('leak')) {
      return {
        severity: 'medium',
        rationale: 'Mock classified as medium: contains utility or blockage keywords.'
      };
    }
    return {
      severity: 'low',
      rationale: 'Mock classified as low: no critical keywords found.'
    };
  }

  const prompt = `
You are an emergency response dispatcher for a neighborhood community platform.
Classify the following emergency alert post into one of three severity levels: 
- "low" (local minor issues like water logging, lost pets/keys, localized utility issues)
- "medium" (area-wide issues like neighborhood power outage, main road blockage)
- "critical" (immediate threat to life, health, or property like active fire, severe medical emergency, natural disaster).

Return a JSON object with keys:
- "severity" (must be exactly "low", "medium", or "critical")
- "rationale" (1 sentence explanation)

Title: ${title || ''}
Body: ${body}
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error('Gemini call failed inside classifyEmergency, falling back to low:', err.message);
    return {
      severity: 'low',
      rationale: `Fallback applied due to API failure: ${err.message}`
    };
  }
}

/**
 * AI Embeddings Generation (for lost & found semantic matching)
 */
async function generateEmbedding(text) {
  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Generating mock vector embedding of 768 dimensions');
    const vec = [];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < 768; i++) {
      const val = Math.sin(hash + i) * 0.1;
      vec.push(parseFloat(val.toFixed(6)));
    }
    return vec;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "models/gemini-embedding-2",
      content: {
        parts: [{ text }]
      },
      outputDimensionality: 768
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Embedding API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error('Invalid embedding response from Gemini');
  }
  return data.embedding.values;
}

/**
 * AI Community Digest Summariser
 */
async function summarizePosts(posts) {
  if (!posts || posts.length === 0) {
    return "• No updates in your community this week.";
  }

  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Summarising posts');
    const lines = posts.slice(0, 5).map((p) => `• ${p.title || 'Update'}: ${p.body.substring(0, 60)}...`);
    while (lines.length < 5) {
      lines.push('• Stay safe and keep connecting with your neighbors.');
    }
    return lines.join('\n');
  }

  const postsText = posts.map((p, idx) => `Post #${idx+1}: [${p.type.toUpperCase()}] Title: ${p.title || 'No Title'} | Body: ${p.body}`).join('\n\n');
  const prompt = `
You are a community manager summarizing the week's neighborhood updates.
Please write a concise 5-line plain-English bulleted summary highlighting the most important updates, events, or alerts from this list.
Ensure there are exactly 5 bullet points (each starting with a bullet character •). Do not include any extra introductory or concluding text.

Neighborhood Posts:
${postsText}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : '• Weekly updates summarized.';
  } catch (err) {
    console.error('Gemini call failed inside summarizePosts, using mock:', err.message);
    const lines = posts.slice(0, 5).map((p) => `• ${p.title || 'Update'}: ${p.body.substring(0, 60)}...`);
    while (lines.length < 5) {
      lines.push('• Stay safe and keep connecting with your neighbors.');
    }
    return lines.join('\n');
  }
}

/**
 * AI Multilingual Text Translation
 */
async function translateText(title, body, targetLanguage) {
  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Translating text to', targetLanguage);
    return {
      title: title ? `[${targetLanguage}] ${title}` : '',
      body: `[${targetLanguage}] ${body} (Note: This is a mock translation.)`
    };
  }

  const prompt = `
You are a multilingual translator for a neighborhood community platform.
Translate the following post title and body into the requested language: "${targetLanguage}".
Ensure the translation matches local cultural context (especially for Indian languages like Hindi, Tamil, etc.).
Keep formatting, numbers, and proper nouns intact. Do not add any preamble or remarks.
Respond with a JSON object containing "title" and "body" keys.

Title: ${title || ''}
Body: ${body}
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error('Gemini call failed inside translateText, falling back to mock:', err.message);
    return {
      title: title ? `[${targetLanguage}] ${title}` : '',
      body: `[${targetLanguage}] ${body} (Translation fallback applied: ${err.message})`
    };
  }
}

/**
 * AI Smart Poll Question / Options Generator
 */
async function generatePollOptions(topic) {
  if (!GEMINI_API_KEY) {
    console.log('[AI MOCK] Generating poll options for', topic);
    return {
      options: [
        `Yes, support ${topic}`,
        `No, oppose ${topic}`,
        `Need more discussions on ${topic}`,
        `Neutral / No opinion`
      ]
    };
  }

  const prompt = `
You are a community coordinator generating a fair, neutral, and unbiased poll.
Generate 4 to 5 balanced options for a poll about the following topic: "${topic}".
Avoid leading questions or loaded phrasing. Ensure different perspectives are represented neutrally.
Respond with a JSON object containing an "options" key, which is an array of strings (each string should be a poll option, max 60 characters).

Topic: ${topic}
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error('Gemini call failed inside generatePollOptions, falling back to mock:', err.message);
    return {
      options: [
        `Option 1 for ${topic}`,
        `Option 2 for ${topic}`,
        `Option 3 for ${topic}`,
        `Option 4 for ${topic}`
      ]
    };
  }
}

module.exports = {
  improvePost,
  moderateContent,
  classifyEmergency,
  generateEmbedding,
  summarizePosts,
  translateText,
  generatePollOptions
};
