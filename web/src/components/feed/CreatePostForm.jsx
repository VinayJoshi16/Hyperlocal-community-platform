// One form handles all 7 post types.
// Type selector shows only the types the current user's role allows.
// Selecting 'event' reveals date/time/venue fields.
// Selecting 'poll' reveals the option builder (2-6 options, add/remove).
// Emergency type turns the card red and changes the submit button label.

const POST_TYPES = [
  { type: 'announcement', label: 'Update',    roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'event',        label: 'Event',     roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'lost_found',   label: 'Lost & Found', roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'business',     label: 'Business',  roles: ['business', 'admin'] },
  { type: 'poll',         label: 'Poll',      roles: ['user', 'admin', 'business', 'moderator'] },
  { type: 'notice',       label: 'Notice',    roles: ['admin'] },
  { type: 'emergency',    label: 'Alert',     roles: ['admin', 'moderator'] },
]

// availableTypes = POST_TYPES.filter(t => t.roles.includes(user.role))
// so a regular user never even sees Notice or Emergency as options