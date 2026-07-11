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

  // Robustly extract the outermost JSON object to ignore preambles or trailing explanations
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error(`No valid JSON object found in response: "${text}"`);
  }
  const jsonString = text.substring(firstBrace, lastBrace + 1);
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

module.exports = {
  improvePost,
  moderateContent,
  classifyEmergency
};
