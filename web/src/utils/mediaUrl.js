// Helpers for post media URLs. Fit mode is stored as a URL fragment (#contain, #square)
// but must not be included in img/video src — fragments are for CSS hints only.

export function getMediaFit(url) {
  if (!url) return 'cover'
  if (url.endsWith('#contain')) return 'contain'
  if (url.endsWith('#square')) return 'square'
  return 'cover'
}

export function getMediaSrc(url) {
  if (!url) return url
  return url.split('#')[0]
}
