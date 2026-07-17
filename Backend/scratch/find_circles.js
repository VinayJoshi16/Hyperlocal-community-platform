const { query } = require('../src/config/db');

async function test() {
  const circles = await query('SELECT id, name, privacy FROM circles');
  console.log('CIRCLES:', circles.rows);
  
  for (const c of circles.rows) {
    const msgCount = await query('SELECT count(*)::int FROM circle_messages WHERE circle_id = $1', [c.id]);
    const members = await query('SELECT u.name, cm.role FROM circle_members cm JOIN users u ON u.id = cm.user_id WHERE cm.circle_id = $1', [c.id]);
    console.log(`Circle "${c.name}" (ID: ${c.id}) has ${msgCount.rows[0].count} messages. Members:`, members.rows);
  }
  process.exit(0);
}

test();
