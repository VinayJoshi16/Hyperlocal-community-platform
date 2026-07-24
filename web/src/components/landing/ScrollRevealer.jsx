import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function ScrollRevealer({ children, isFirst = false, isLast = false }) {
  const ref = useRef(null)

  // Track scroll progress of the current section relative to the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Smooth out the scroll progress using a spring physics simulation
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 120,
    restDelta: 0.001
  })

  // Define transitions based on section position in the document flow
  let opacity, scale, y

  if (isFirst) {
    // First section (e.g. Hero): Visible at page load, fades out as you scroll down
    opacity = useTransform(smoothProgress, [0.5, 0.8, 1], [1, 1, 0])
    scale = useTransform(smoothProgress, [0.5, 0.8, 1], [1, 1, 0.96])
    y = useTransform(smoothProgress, [0.5, 0.8, 1], [0, 0, -60])
  } else if (isLast) {
    // Last section (e.g. CTA): Fades in as you scroll down, stays visible at bottom
    opacity = useTransform(smoothProgress, [0, 0.35, 0.65], [0, 1, 1])
    scale = useTransform(smoothProgress, [0, 0.35, 0.65], [0.96, 1, 1])
    y = useTransform(smoothProgress, [0, 0.35, 0.65], [60, 0, 0])
  } else {
    // Middle sections: Fades in from bottom, stays centered, fades out to top
    opacity = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0])
    scale = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [0.96, 1, 1, 0.96])
    y = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [60, 0, 0, -60])
  }

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        scale,
        y
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  )
}
