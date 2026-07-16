const { query } = require('../config/db');

// Helper: check if a user is a member of a circle
async function checkMembership(circleId, userId) {
  const res = await query(
    'SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2',
    [circleId, userId]
  );
  return res.rows.length > 0 ? res.rows[0].role : null;
}

/**
 * Get all circles for the user's active location.
 * Computes membership status, last message info, and unread count.
 */
async function getCircles(req, res) {
  const userId = req.user.id;
  const locationId = req.header('X-Active-Location-Id');

  if (!locationId) {
    return res.status(400).json({ error: 'X-Active-Location-Id header is required' });
  }

  try {
    // 1. Get all circles at this location
    const circlesRes = await query(
      `SELECT c.*, 
              (SELECT COUNT(*)::int FROM circle_members WHERE circle_id = c.id) as member_count,
              m.role as my_role
       FROM circles c
       LEFT JOIN circle_members m ON m.circle_id = c.id AND m.user_id = $1
       WHERE c.location_id = $2
       ORDER BY c.last_message_at DESC, c.created_at DESC`,
      [userId, locationId]
    );

    const circles = circlesRes.rows;

    // 2. Compute unread count for each circle the user belongs to
    for (let c of circles) {
      if (c.my_role) {
        const unreadRes = await query(
          `SELECT COUNT(*)::int 
           FROM circle_messages m
           LEFT JOIN circle_message_views v ON v.message_id = m.id AND v.user_id = $1
           WHERE m.circle_id = $2 
             AND m.user_id != $1
             AND v.message_id IS NULL`,
          [userId, c.id]
        );
        c.unread_count = unreadRes.rows[0].count;
      } else {
        c.unread_count = 0;
      }
    }

    res.json(circles);
  } catch (err) {
    console.error('Error in getCircles:', err.message);
    res.status(500).json({ error: 'Failed to retrieve circles' });
  }
}

/**
 * Create a new circle
 */
async function createCircle(req, res) {
  const userId = req.user.id;
  const locationId = req.header('X-Active-Location-Id');
  const { name, description, image_url, privacy } = req.body;

  if (!locationId) {
    return res.status(400).json({ error: 'X-Active-Location-Id header is required' });
  }
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Circle name is required' });
  }

  try {
    // 1. Insert circle
    const circleRes = await query(
      `INSERT INTO circles (name, description, image_url, privacy, created_by, location_id, last_message, last_message_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [name.trim(), description || '', image_url || null, privacy || 'public', userId, locationId, 'Circle created 🎉']
    );
    const circle = circleRes.rows[0];

    // 2. Add creator as admin
    await query(
      'INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, $3)',
      [circle.id, userId, 'admin']
    );

    res.status(201).json({ ...circle, my_role: 'admin', member_count: 1, unread_count: 0 });
  } catch (err) {
    console.error('Error in createCircle:', err.message);
    res.status(500).json({ error: 'Failed to create circle' });
  }
}

/**
 * Get details of a single circle (including pending requests)
 */
async function getCircleDetails(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const circleRes = await query(
      `SELECT c.*, 
              (SELECT COUNT(*)::int FROM circle_members WHERE circle_id = c.id) as member_count
       FROM circles c
       WHERE c.id = $1`,
      [id]
    );

    if (circleRes.rows.length === 0) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    const circle = circleRes.rows[0];

    // Check user membership role
    const role = await checkMembership(id, userId);

    // Check if user has a pending join request
    let joinRequestStatus = null;
    if (!role) {
      const reqRes = await query(
        'SELECT status FROM circle_join_requests WHERE circle_id = $1 AND user_id = $2',
        [id, userId]
      );
      if (reqRes.rows.length > 0) {
        joinRequestStatus = reqRes.rows[0].status;
      }
    }

    res.json({
      ...circle,
      my_role: role,
      join_request_status: joinRequestStatus
    });
  } catch (err) {
    console.error('Error in getCircleDetails:', err.message);
    res.status(500).json({ error: 'Failed to retrieve circle details' });
  }
}

/**
 * Join a circle
 */
async function joinCircle(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const circleRes = await query('SELECT * FROM circles WHERE id = $1', [id]);
    if (circleRes.rows.length === 0) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    const circle = circleRes.rows[0];

    const currentRole = await checkMembership(id, userId);
    if (currentRole) {
      return res.status(400).json({ error: 'You are already a member of this circle' });
    }

    if (circle.privacy === 'public') {
      // Join immediately
      await query(
        'INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, $3)',
        [id, userId, 'member']
      );
      return res.json({ status: 'joined', role: 'member' });
    } else if (circle.privacy === 'private') {
      // Create Join Request
      await query(
        `INSERT INTO circle_join_requests (circle_id, user_id, status) 
         VALUES ($1, $2, 'pending') 
         ON CONFLICT (circle_id, user_id) DO UPDATE SET status = 'pending'`,
        [id, userId]
      );
      return res.json({ status: 'requested' });
    } else {
      return res.status(403).json({ error: 'This circle is invite-only' });
    }
  } catch (err) {
    console.error('Error in joinCircle:', err.message);
    res.status(500).json({ error: 'Failed to join circle' });
  }
}

/**
 * Update circle details (privacy, avatar, etc.)
 */
async function updateCircleSettings(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, description, image_url, privacy } = req.body;

  try {
    const role = await checkMembership(id, userId);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can modify circle settings' });
    }

    const updatedRes = await query(
      `UPDATE circles 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           privacy = COALESCE($4, privacy)
       WHERE id = $5
       RETURNING *`,
      [name, description, image_url, privacy, id]
    );

    res.json(updatedRes.rows[0]);
  } catch (err) {
    console.error('Error in updateCircleSettings:', err.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

/**
 * Get messages from a circle
 */
async function getCircleMessages(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const role = await checkMembership(id, userId);
    if (!role) {
      return res.status(403).json({ error: 'Access denied: not a member' });
    }

    const messagesRes = await query(
      `SELECT m.*, u.name as author_name, u.email as author_email,
              EXISTS(
                SELECT 1 FROM circle_message_views v 
                WHERE v.message_id = m.id AND v.user_id != m.user_id
              ) as viewed_by_others
       FROM circle_messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.circle_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    res.json(messagesRes.rows);
  } catch (err) {
    console.error('Error in getCircleMessages:', err.message);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
}

/**
 * Post a new message
 */
async function postCircleMessage(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const role = await checkMembership(id, userId);
    if (!role) {
      return res.status(403).json({ error: 'Access denied: not a member' });
    }

    // 1. Insert message
    const msgRes = await query(
      `INSERT INTO circle_messages (circle_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, message.trim()]
    );
    const msg = msgRes.rows[0];

    // 2. Cache last message info in circles
    await query(
      `UPDATE circles 
       SET last_message = $1, 
           last_message_at = NOW() 
       WHERE id = $2`,
      [message.substring(0, 80).trim(), id]
    );

    // 3. Automatically record sender's own view
    await query(
      'INSERT INTO circle_message_views (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [msg.id, userId]
    );

    // Get author details
    const authorRes = await query('SELECT name, email FROM users WHERE id = $1', [userId]);
    const fullMsg = {
      ...msg,
      author_name: authorRes.rows[0].name,
      author_email: authorRes.rows[0].email,
      viewed_by_others: false
    };

    // 4. Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_message', fullMsg);
      // Trigger global update on circles list last message
      io.to(`location:${req.header('X-Active-Location-Id')}`).emit('circle_list_update', {
        circle_id: id,
        last_message: message.substring(0, 80).trim(),
        last_message_at: msg.created_at
      });
    }

    res.status(201).json(fullMsg);
  } catch (err) {
    console.error('Error in postCircleMessage:', err.message);
    res.status(500).json({ error: 'Failed to post message' });
  }
}

/**
 * Mark messages as viewed (White -> Blue Dot)
 */
async function markMessagesViewed(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { messageIds } = req.body; // array of message UUIDs

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ error: 'messageIds array is required' });
  }

  try {
    const role = await checkMembership(id, userId);
    if (!role) {
      return res.status(403).json({ error: 'Access denied: not a member' });
    }

    // Insert view records
    for (let msgId of messageIds) {
      await query(
        'INSERT INTO circle_message_views (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [msgId, userId]
      );
    }

    // Live Socket.io broadcast to trigger dot updates instantly
    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_messages_viewed', {
        user_id: userId,
        message_ids: messageIds
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in markMessagesViewed:', err.message);
    res.status(500).json({ error: 'Failed to record views' });
  }
}

/**
 * Notice Pinboard Manager
 */
async function getCirclePins(req, res) {
  const { id } = req.params;
  try {
    const pins = await query(
      `SELECT p.*, u.name as creator_name 
       FROM circle_pins p
       JOIN users u ON u.id = p.created_by
       WHERE p.circle_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );
    res.json(pins.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get pins' });
  }
}

async function addCirclePin(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { content } = req.body;

  try {
    const role = await checkMembership(id, userId);
    if (!role) return res.status(403).json({ error: 'Not a member' });

    const pinRes = await query(
      'INSERT INTO circle_pins (circle_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
      [id, content, userId]
    );

    const authorRes = await query('SELECT name FROM users WHERE id = $1', [userId]);
    const fullPin = { ...pinRes.rows[0], creator_name: authorRes.rows[0].name };

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_pin_update', { action: 'add', pin: fullPin });
    }

    res.status(201).json(fullPin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add pin' });
  }
}

async function deleteCirclePin(req, res) {
  const userId = req.user.id;
  const { id, pinId } = req.params;

  try {
    const role = await checkMembership(id, userId);
    if (!role) return res.status(403).json({ error: 'Not a member' });

    await query('DELETE FROM circle_pins WHERE id = $1 AND circle_id = $2', [pinId, id]);

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_pin_update', { action: 'delete', pinId });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pin' });
  }
}

/**
 * Live Polls Manager
 */
async function getCirclePolls(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const pollsRes = await query(
      `SELECT p.*, u.name as creator_name,
              (SELECT option_index FROM circle_poll_votes WHERE poll_id = p.id AND user_id = $2) as my_vote
       FROM circle_polls p
       JOIN users u ON u.id = p.created_by
       WHERE p.circle_id = $1
       ORDER BY p.created_at DESC`,
      [id, userId]
    );

    const polls = pollsRes.rows;
    for (let poll of polls) {
      const votesRes = await query(
        `SELECT option_index, COUNT(*)::int as count 
         FROM circle_poll_votes 
         WHERE poll_id = $1 
         GROUP BY option_index`,
        [poll.id]
      );
      
      const voteCounts = Array(poll.options.length).fill(0);
      votesRes.rows.forEach(r => {
        voteCounts[r.option_index] = r.count;
      });
      poll.votes = voteCounts;
    }

    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve polls' });
  }
}

async function createCirclePoll(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { question, options } = req.body;

  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Question and at least 2 options are required' });
  }

  try {
    const role = await checkMembership(id, userId);
    if (!role) return res.status(403).json({ error: 'Not a member' });

    const pollRes = await query(
      'INSERT INTO circle_polls (circle_id, question, options, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, question, JSON.stringify(options), userId]
    );

    const authorRes = await query('SELECT name FROM users WHERE id = $1', [userId]);
    const fullPoll = { 
      ...pollRes.rows[0], 
      creator_name: authorRes.rows[0].name,
      votes: Array(options.length).fill(0),
      my_vote: null
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_poll_update', { action: 'create', poll: fullPoll });
    }

    res.status(201).json(fullPoll);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
}

async function voteCirclePoll(req, res) {
  const userId = req.user.id;
  const { id, pollId } = req.params;
  const { optionIndex } = req.body;

  try {
    const role = await checkMembership(id, userId);
    if (!role) return res.status(403).json({ error: 'Not a member' });

    // Insert or update vote
    await query(
      `INSERT INTO circle_poll_votes (poll_id, user_id, option_index) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option_index = $3`,
      [pollId, userId, optionIndex]
    );

    // Fetch updated vote counts
    const votesRes = await query(
      `SELECT option_index, COUNT(*)::int as count 
       FROM circle_poll_votes 
       WHERE poll_id = $1 
       GROUP BY option_index`,
      [pollId]
    );

    const pollDetails = await query('SELECT options FROM circle_polls WHERE id = $1', [pollId]);
    const optionsLen = pollDetails.rows[0].options.length;
    const voteCounts = Array(optionsLen).fill(0);
    votesRes.rows.forEach(r => {
      voteCounts[r.option_index] = r.count;
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_poll_update', { 
        action: 'vote', 
        pollId, 
        votes: voteCounts 
      });
    }

    res.json({ votes: voteCounts, my_vote: optionIndex });
  } catch (err) {
    console.error('Error in voteCirclePoll:', err.message);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
}

/**
 * Shared Events Widget
 */
async function getCircleEvents(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const eventsRes = await query(
      `SELECT e.*, u.name as creator_name,
              (SELECT COUNT(*)::int FROM circle_event_participants WHERE event_id = e.id) as participant_count,
              EXISTS(SELECT 1 FROM circle_event_participants WHERE event_id = e.id AND user_id = $2) as joined
       FROM circle_events e
       JOIN users u ON u.id = e.created_by
       WHERE e.circle_id = $1
       ORDER BY e.event_date ASC, e.event_time ASC`,
      [id, userId]
    );

    res.json(eventsRes.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
}

async function createCircleEvent(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, description, event_date, event_time, location } = req.body;

  if (!title || !event_date || !event_time || !location) {
    return res.status(400).json({ error: 'Title, Date, Time, and Location are required' });
  }

  try {
    const role = await checkMembership(id, userId);
    if (!role) return res.status(403).json({ error: 'Not a member' });

    const eventRes = await query(
      `INSERT INTO circle_events (circle_id, title, description, event_date, event_time, location, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, title, description || '', event_date, event_time, location, userId]
    );

    const authorRes = await query('SELECT name FROM users WHERE id = $1', [userId]);
    const fullEvent = {
      ...eventRes.rows[0],
      creator_name: authorRes.rows[0].name,
      participant_count: 0,
      joined: false
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_event_update', { action: 'create', event: fullEvent });
    }

    res.status(201).json(fullEvent);
  } catch (err) {
    console.error('Error in createCircleEvent:', err.message);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

async function toggleJoinCircleEvent(req, res) {
  const userId = req.user.id;
  const { id, eventId } = req.params;

  try {
    const role = await checkMembership(id, userId);
    if (!role) return res.status(403).json({ error: 'Not a member' });

    // Check if user has already joined
    const checkRes = await query(
      'SELECT 1 FROM circle_event_participants WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    let joined = false;
    if (checkRes.rows.length > 0) {
      // Leave
      await query('DELETE FROM circle_event_participants WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
    } else {
      // Join
      await query('INSERT INTO circle_event_participants (event_id, user_id) VALUES ($1, $2)', [eventId, userId]);
      joined = true;
    }

    const countRes = await query(
      'SELECT COUNT(*)::int FROM circle_event_participants WHERE event_id = $1',
      [eventId]
    );
    const count = countRes.rows[0].count;

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_event_update', {
        action: 'join_toggle',
        eventId,
        count
      });
    }

    res.json({ joined, participant_count: count });
  } catch (err) {
    console.error('Error in toggleJoinCircleEvent:', err.message);
    res.status(500).json({ error: 'Failed to toggle event attendance' });
  }
}

/**
 * Member Manager direct add & search
 */
async function searchNeighborhoodUsers(req, res) {
  const activeLocationId = req.header('X-Active-Location-Id');
  const { q } = req.query;

  if (!activeLocationId) {
    return res.status(400).json({ error: 'X-Active-Location-Id is required' });
  }

  try {
    // Search users who are associated with this location
    const searchRes = await query(
      `SELECT u.id, u.name, u.email 
       FROM users u
       JOIN user_locations ul ON ul.user_id = u.id
       WHERE ul.location_id = $1
         AND (u.name ILIKE $2 OR u.email ILIKE $2)
       LIMIT 10`,
      [activeLocationId, `%${q || ''}%`]
    );

    res.json(searchRes.rows);
  } catch (err) {
    console.error('Error in searchNeighborhoodUsers:', err.message);
    res.status(500).json({ error: 'Failed to search users' });
  }
}

async function addCircleMember(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { targetUserId } = req.body;

  try {
    const role = await checkMembership(id, userId);
    // Only admins can invite if invite_only, otherwise members can too
    const circleRes = await query('SELECT privacy FROM circles WHERE id = $1', [id]);
    if (circleRes.rows.length === 0) return res.status(404).json({ error: 'Circle not found' });
    
    if (circleRes.rows[0].privacy === 'invite_only' && role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add members to this circle' });
    }
    if (!role) {
      return res.status(403).json({ error: 'You must be a member to add others' });
    }

    // Insert user as member
    await query(
      'INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [id, targetUserId, 'member']
    );

    // Live Socket broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${id}`).emit('circle_member_added', { circle_id: id, user_id: targetUserId });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in addCircleMember:', err.message);
    res.status(500).json({ error: 'Failed to add member' });
  }
}

/**
 * Handle Pending Join Requests (Private Mode)
 */
async function getJoinRequests(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const role = await checkMembership(id, userId);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view join requests' });
    }

    const requestsRes = await query(
      `SELECT r.*, u.name, u.email 
       FROM circle_join_requests r
       JOIN users u ON u.id = r.user_id
       WHERE r.circle_id = $1 AND r.status = 'pending'`,
      [id]
    );

    res.json(requestsRes.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch join requests' });
  }
}

async function handleJoinRequest(req, res) {
  const userId = req.user.id;
  const { id, targetUserId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  try {
    const role = await checkMembership(id, userId);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can process join requests' });
    }

    if (action === 'approve') {
      await query(
        `UPDATE circle_join_requests SET status = 'approved' WHERE circle_id = $1 AND user_id = $2`,
        [id, targetUserId]
      );
      await query(
        'INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [id, targetUserId, 'member']
      );

      const io = req.app.get('io');
      if (io) {
        io.to(`circle:${id}`).emit('circle_member_added', { circle_id: id, user_id: targetUserId });
      }
    } else {
      await query(
        `UPDATE circle_join_requests SET status = 'rejected' WHERE circle_id = $1 AND user_id = $2`,
        [id, targetUserId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in handleJoinRequest:', err.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
}

/**
 * Delete a chat message
 */
async function deleteCircleMessage(req, res) {
  const userId = req.user.id;
  const { id: circleId, messageId } = req.params;

  try {
    const role = await checkMembership(circleId, userId);
    const msgRes = await query('SELECT user_id FROM circle_messages WHERE id = $1', [messageId]);
    if (msgRes.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    const message = msgRes.rows[0];

    const isAuthor = message.user_id === userId;
    const isAdmin = role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Only the author or group admin can delete messages' });
    }

    await query('DELETE FROM circle_messages WHERE id = $1', [messageId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${circleId}`).emit('circle_message_delete', { messageId });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in deleteCircleMessage:', err.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
}

/**
 * Delete a live poll
 */
async function deleteCirclePoll(req, res) {
  const userId = req.user.id;
  const { id: circleId, pollId } = req.params;

  try {
    const role = await checkMembership(circleId, userId);
    const pollRes = await query('SELECT created_by FROM circle_polls WHERE id = $1', [pollId]);
    if (pollRes.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    const poll = pollRes.rows[0];

    const isCreator = poll.created_by === userId;
    const isAdmin = role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Only the poll creator or group admin can delete polls' });
    }

    await query('DELETE FROM circle_polls WHERE id = $1', [pollId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${circleId}`).emit('circle_poll_update', { action: 'delete', pollId });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in deleteCirclePoll:', err.message);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
}

/**
 * Delete a scheduled event
 */
async function deleteCircleEvent(req, res) {
  const userId = req.user.id;
  const { id: circleId, eventId } = req.params;

  try {
    const role = await checkMembership(circleId, userId);
    const eventRes = await query('SELECT created_by FROM circle_events WHERE id = $1', [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = eventRes.rows[0];

    const isCreator = event.created_by === userId;
    const isAdmin = role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Only the event creator or group admin can delete events' });
    }

    await query('DELETE FROM circle_events WHERE id = $1', [eventId]);

    const io = req.app.get('io');
    if (io) {
      io.to(`circle:${circleId}`).emit('circle_event_update', { action: 'delete', eventId });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in deleteCircleEvent:', err.message);
    res.status(500).json({ error: 'Failed to delete event' });
  }
}

module.exports = {
  getCircles,
  createCircle,
  getCircleDetails,
  joinCircle,
  updateCircleSettings,
  getCircleMessages,
  postCircleMessage,
  markMessagesViewed,
  getCirclePins,
  addCirclePin,
  deleteCirclePin,
  getCirclePolls,
  createCirclePoll,
  voteCirclePoll,
  getCircleEvents,
  createCircleEvent,
  toggleJoinCircleEvent,
  searchNeighborhoodUsers,
  addCircleMember,
  getJoinRequests,
  handleJoinRequest,
  deleteCircleMessage,
  deleteCirclePoll,
  deleteCircleEvent
};
