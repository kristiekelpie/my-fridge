'use client'

interface Props {
  size?: number
  className?: string
}

export default function F15Magnet({ size = 52, className = '' }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/magnets/f15-magnet.png"
      alt=""
      aria-hidden
      width={size}
      height={Math.round(size * (244 / 258))}
      className={`block h-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.22)] ${className}`}
      style={{ width: size }}
    />
  )
}
