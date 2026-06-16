'use client'

import { useId } from 'react'

interface Props {
  size?: number
  className?: string
}

export default function HeartMagnet({ size = 22, className = '' }: Props) {
  const gradId = useId()
  const height = Math.round(size * (20 / 22))

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 24 22"
      className={`drop-shadow-sm ${className}`}
      aria-hidden
    >
      <path
        d="M12 20.5s-8.5-5.4-8.5-11.2C3.5 6.2 6.4 3.5 9.5 3.5c1.8 0 3.4 1 4.2 2.5.8-1.5 2.4-2.5 4.2-2.5 3.1 0 6 2.7 6 5.8 0 5.8-8.5 11.2-8.5 11.2z"
        fill="#E53935"
      />
      <path
        d="M12 20.5s-8.5-5.4-8.5-11.2C3.5 6.2 6.4 3.5 9.5 3.5c1.8 0 3.4 1 4.2 2.5.8-1.5 2.4-2.5 4.2-2.5 3.1 0 6 2.7 6 5.8 0 5.8-8.5 11.2-8.5 11.2z"
        fill={`url(#${gradId})`}
        opacity="0.35"
      />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  )
}
