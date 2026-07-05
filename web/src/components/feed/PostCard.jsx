// PostCard: one component handles all 7 post types.
// Each type shares the same header (avatar, author, badge, time)
// but gets type-specific content rendering below it.

const TYPE_CONFIG = {
  announcement: { label: 'Announcement', className: 'type-announcement' },
  notice:       { label: 'Notice',       className: 'type-notice' },
  event:        { label: 'Event',        className: 'type-event' },
  lost_found:   { label: 'Lost & Found', className: 'type-lost_found' },
  business:     { label: 'Business',     className: 'type-business' },
  poll:         { label: 'Poll',         className: 'type-poll' },
  emergency:    { label: 'Emergency',    className: 'type-emergency' },
}

export default function PostCard({ post }) {
  // Emergency posts get a red card background + top stripe
  // Event posts show date/time/venue/RSVP count chips
  // Lost & found shows expiry countdown
  // All types: author avatar, role badge, type badge, pinned indicator
  // Footer: heart reaction (toggles, optimistic update) + comment count
  // Clicking anywhere on card navigates to /posts/:id
  // except clicks on buttons (handled by stopPropagation or closest() check)
}