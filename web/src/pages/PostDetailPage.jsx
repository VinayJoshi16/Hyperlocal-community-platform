// Full post detail page:
// - Complete post content (no line-clamp)
// - Event card with RSVP button
// - Poll with animated progress bar voting UI
// - Comments thread with author avatars
// - Add comment form
// - Delete controls (own content or admin/mod)

export default function PostDetailPage() {
  const { id } = useParams()

  // Poll voting with optimistic progress bars
  async function handleVote(index) {
    if (votedIndex !== null) return  // already voted
    const res = await postsAPI.vote(id, index)
    setVotedIndex(index)
    setVotes(res.data.data.votes)
  }

  // Progress bar fill based on vote percentage
  // <div style={{ width: `${pct}%` }} className="absolute inset-0 bg-primary-50" />

  // Comments are fetched on mount alongside the post
  // via Promise.all so both load in one round trip
}