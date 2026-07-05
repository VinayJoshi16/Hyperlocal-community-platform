import React from 'react'

/**
 * Automatically converts text URLs starting with http:// or https:// into clickable, styled links.
 * Stops event propagation to prevent triggering card click handlers.
 */
export function renderBodyWithLinks(text) {
  if (!text) return ''

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-850 hover:underline break-all font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return part
  })
}
