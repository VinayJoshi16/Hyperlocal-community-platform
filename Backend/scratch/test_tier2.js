const { query } = require('../src/config/db');
const aiService = require('../src/services/aiService');
const { findMatchesForPost, createPost } = require('../src/models/postModel');
const { sendWeeklyDigests } = require('../src/services/digestScheduler');

async function runTests() {
  console.log('--- STARTING TIER 2 AI FEATURES INTEGRATION TESTS ---');

  // Test 1: AI Translation
  console.log('\n[Test 1] Testing AI Translation...');
  try {
    const translation = await aiService.translateText(
      'Notice: Lift Maintenance scheduled',
      'The elevator will be serviced this Tuesday from 2 PM to 5 PM. Please use stairs.',
      'Hindi'
    );
    console.log('Translation success! Result:', translation);
  } catch (err) {
    console.error('Translation failed:', err.message);
  }

  // Test 2: AI Poll Options Generator
  console.log('\n[Test 2] Testing AI Poll Options Generator...');
  try {
    const pollResult = await aiService.generatePollOptions('parking space allotment rules');
    console.log('Poll Options success! Result:', pollResult);
  } catch (err) {
    console.error('Poll Options failed:', err.message);
  }

  // Test 3: AI Summarization for digest
  console.log('\n[Test 3] Testing AI Weekly Digest Summarizer...');
  try {
    const posts = [
      { type: 'notice', title: 'Power shutdown', body: 'Power outage on Thursday 9am-12pm.' },
      { type: 'event', title: 'Garden workshop', body: 'Learn organic composting at the community garden on Sunday 10am.' }
    ];
    const summary = await aiService.summarizePosts(posts);
    console.log('Summarisation success! Result:\n', summary);
  } catch (err) {
    console.error('Summarisation failed:', err.message);
  }

  // Test 4: Lost & Found Matcher (pgvector Embeddings)
  console.log('\n[Test 4] Testing Lost & Found Matcher (pgvector & Embeddings)...');
  try {
    // Let's create a test community/location and user to bind posts to
    const locRes = await query('SELECT id FROM locations LIMIT 1');
    const userRes = await query('SELECT id FROM users LIMIT 1');
    if (locRes.rows.length === 0 || userRes.rows.length === 0) {
      console.log('Skipping Lost & Found matcher test: No user or location found in database.');
    } else {
      const locationId = locRes.rows[0].id;
      const authorId = userRes.rows[0].id;

      // Generate embeddings
      const txtLost = 'Lost a black labrador pet dog with a red collar near block C';
      const txtFound = 'Found a black labrador pup running around the block C park';

      console.log('Generating embedding for lost post...');
      const embLost = await aiService.generateEmbedding(txtLost);
      console.log('Generating embedding for found post...');
      const embFound = await aiService.generateEmbedding(txtFound);

      console.log('Creating lost post in DB...');
      const lostPost = await createPost({
        authorId,
        locationId,
        type: 'lost_found',
        title: 'Lost Black Lab',
        body: txtLost,
        embedding: embLost
      });

      console.log('Creating found post in DB...');
      const foundPost = await createPost({
        authorId,
        locationId,
        type: 'lost_found',
        title: 'Found Labrador puppy',
        body: txtFound,
        embedding: embFound
      });

      console.log(`Checking matches for lost post ${lostPost.id}...`);
      const matches = await findMatchesForPost(lostPost.id, authorId);
      console.log(`Found ${matches.length} semantic matches:`);
      matches.forEach((m, idx) => {
        console.log(`  Match #${idx + 1}: ID=${m.id} "${m.title}" - Similarity=${Math.round((1 - m.cosine_distance) * 100)}%`);
      });

      // Cleanup
      await query('DELETE FROM posts WHERE id IN ($1, $2)', [lostPost.id, foundPost.id]);
      console.log('Cleaned up test posts.');
    }
  } catch (err) {
    console.error('Lost & Found Matcher test failed:', err.message);
  }

  // Test 5: Digest Email Compilation
  console.log('\n[Test 5] Testing weekly digest distribution logic...');
  try {
    await sendWeeklyDigests();
    console.log('Weekly digests logic completed successfully.');
  } catch (err) {
    console.error('Weekly digest distribution failed:', err.message);
  }

  console.log('\n--- TESTS COMPLETED ---');
  process.exit(0);
}

runTests();
