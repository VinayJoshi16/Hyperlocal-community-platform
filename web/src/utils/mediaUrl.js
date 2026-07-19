// Upload paths stay relative (/uploads/...) so Vite (dev) and Vercel (prod) can proxy them.

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return url

  if (url.startsWith('/uploads/')) return url

  const idx = url.indexOf('/uploads/')
  if (idx !== -1) return url.slice(idx)

  return url
}

export function getMediaFit(url) {
  if (!url) return 'cover'
  if (url.endsWith('#contain')) return 'contain'
  if (url.endsWith('#square')) return 'square'
  return 'cover'
}

export function getMediaSrc(url) {
  if (!url) return url
  return resolveMediaUrl(url).split('#')[0]
}
