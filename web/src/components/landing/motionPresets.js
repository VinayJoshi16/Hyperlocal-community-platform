// Shared premium animation presets for the landing page.
// Tuned for high-fidelity, hardware-accelerated transitions.

export const expoEase = [0.16, 1, 0.3, 1] // cubic-bezier(0.16, 1, 0.3, 1) or easeOutExpo

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: expoEase } },
}

export const fadeUpSmall = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: expoEase } },
}

export const textHeading = {
  hidden: { opacity: 0, y: 40, letterSpacing: '0.02em' },
  show: {
    opacity: 1,
    y: 0,
    letterSpacing: '-0.02em', // Slightly tightens tracking on reveal
    transition: { duration: 0.8, ease: expoEase }
  }
}

export const textParagraph = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: expoEase }
  }
}

export const revealButton = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 18
    }
  }
}

export const revealImage = {
  hidden: { opacity: 0, scale: 0.92, y: 80, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.95, ease: expoEase }
  }
}

export const revealCard = {
  hidden: { opacity: 0, scale: 0.95, y: 25 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: expoEase }
  }
}

export const stagger = (staggerChildren = 0.12, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
})

export const viewportOnce = { once: true, margin: '-100px' }
