/**
 * Verification script for testing AI features locally
 * Usage: node scratch/test_ai.js
 */

require('dotenv').config();
const aiService = require('../src/services/aiService');

async function testRewrite() {
  console.log('\n--- Testing AI Post Polish / Rewrite ---');
  const title = 'help lost dog';
  const body = 'i lost my black lab labrador puppy near park street yesterday around 4pm. he was wearing a blue collar. please help me find him';
  const type = 'lost_found';

  try {
    const result = await aiService.improvePost(title, body, type);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error during AI Polish test:', err.message);
  }
}

async function testModeration() {
  console.log('\n--- Testing AI Content Moderation ---');
  
  // Test case 1: Normal post
  const title1 = 'Gardening event next sunday';
  const body1 = 'We are organizing a gardening event in the community park. All residents are welcome to join!';
  
  // Test case 2: Flagged post (using trigger keywords)
  const title2 = 'Get rich fast';
  const body2 = 'Send money to get rich fast. This is a scam-test-flag marketing post!';

  try {
    console.log('Test case 1 (Normal):');
    const res1 = await aiService.moderateContent(title1, body1);
    console.log('Result:', JSON.stringify(res1, null, 2));

    console.log('Test case 2 (Flagged):');
    const res2 = await aiService.moderateContent(title2, body2);
    console.log('Result:', JSON.stringify(res2, null, 2));
  } catch (err) {
    console.error('Error during AI Moderation test:', err.message);
  }
}

async function testEmergencyClassification() {
  console.log('\n--- Testing Emergency Severity Classification ---');

  // Test case 1: Low emergency
  const title1 = 'Water logging in lane 2';
  const body1 = 'There is minor water logging near the gate of lane 2. Watch your step.';

  // Test case 2: Critical emergency
  const title2 = 'Major fire in block C';
  const body2 = 'A large fire has broken out in the electrical shaft of Block C. Fire truck has been called, evacuate immediately!';

  try {
    console.log('Test case 1 (Low):');
    const res1 = await aiService.classifyEmergency(title1, body1);
    console.log('Result:', JSON.stringify(res1, null, 2));

    console.log('Test case 2 (Critical):');
    const res2 = await aiService.classifyEmergency(title2, body2);
    console.log('Result:', JSON.stringify(res2, null, 2));
  } catch (err) {
    console.error('Error during Emergency Classification test:', err.message);
  }
}

async function runAll() {
  console.log('Starting AI services local verification tests...');
  await testRewrite();
  await testModeration();
  await testEmergencyClassification();
  console.log('\nVerification tests finished.');
}

runAll();
