'use client'

/** Matches the classic 6-color fridge magnet set */
export type MagnetColor = 'darkBlue' | 'darkGreen' | 'orange' | 'yellow' | 'lightBlue' | 'red'

const MAGNET: Record<MagnetColor, { face: string; edge: string; highlight: string }> = {
  darkBlue: { face: '#1E5FA8', edge: '#0D3D73', highlight: '#4A8FD4' },
  darkGreen: { face: '#1B8A42', edge: '#0D5A28', highlight: '#4CAF6A' },
  orange: { face: '#E87511', edge: '#B85600', highlight: '#FF9833' },
  yellow: { face: '#F0C020', edge: '#C99A00', highlight: '#FFD54F' },
  lightBlue: { face: '#3DAEE4', edge: '#1E7AAA', highlight: '#7CC8F0' },
  red: { face: '#D62828', edge: '#9B1B1B', highlight: '#EF5350' },
}

/** Alphabet color cycle from the reference photo */
const LETTER_COLOR: Record<string, MagnetColor> = {
  a: 'darkBlue', b: 'darkGreen', c: 'orange', d: 'yellow', e: 'darkGreen', f: 'lightBlue',
  g: 'darkBlue', h: 'red', i: 'orange', j: 'yellow', k: 'darkGreen', l: 'lightBlue',
  m: 'darkBlue', n: 'red', o: 'orange', p: 'yellow', q: 'red', r: 'lightBlue',
  s: 'darkBlue', t: 'red', u: 'orange', v: 'yellow', w: 'darkGreen', x: 'lightBlue',
  y: 'darkBlue', z: 'red',
}

export interface LetterPlacement {
  char: string
  left: string
  top: string
  rotate: number
  color?: MagnetColor
  scale?: number
}

function MagnetLetter({ char, color, rotate, scale = 1 }: {
  char: string
  color: MagnetColor
  rotate: number
  scale?: number
}) {
  const c = MAGNET[color]

  return (
    <span
      className="absolute pointer-events-none select-none"
      style={{
        transform: `rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <span
        className="inline-block font-bold lowercase leading-none"
        style={{
          fontFamily: 'var(--font-magnet), "Varela Round", system-ui, sans-serif',
          fontSize: '1em',
          fontWeight: 600,
          background: `linear-gradient(165deg, ${c.highlight} 0%, ${c.face} 45%, ${c.edge} 100%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0.04em 0.07em 0 ${c.edge}) drop-shadow(0 0.12em 0.14em rgba(0,0,0,0.22))`,
        }}
      >
        {char}
      </span>
    </span>
  )
}

export function MagneticPhrase({ letters, className = '' }: { letters: LetterPlacement[]; className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-[25] ${className}`}
      style={{ fontSize: 'clamp(14px, 3.2vw, 22px)' }}
    >
      {letters.map((letter, i) => (
        <span
          key={`${letter.char}-${i}`}
          className="absolute pointer-events-none"
          style={{ left: letter.left, top: letter.top }}
        >
          <MagnetLetter
            char={letter.char}
            color={letter.color ?? LETTER_COLOR[letter.char] ?? 'red'}
            rotate={letter.rotate}
            scale={letter.scale}
          />
        </span>
      ))}
    </div>
  )
}

/** Freezer door — layered on upper polaroid, drifting right */
export const HELLO_CHEF_LETTERS: LetterPlacement[] = [
  { char: 'h', left: '54%', top: '46%', rotate: -3 },
  { char: 'e', left: '60%', top: '47%', rotate: 2 },
  { char: 'l', left: '66%', top: '46%', rotate: -2 },
  { char: 'l', left: '72%', top: '48%', rotate: 3 },
  { char: 'o', left: '78%', top: '47%', rotate: -2 },
  { char: 'c', left: '58%', top: '58%', rotate: 2 },
  { char: 'h', left: '64%', top: '59%', rotate: -3 },
  { char: 'e', left: '70%', top: '58%', rotate: 2 },
  { char: 'f', left: '76%', top: '59%', rotate: -2 },
]

/** Fridge door — layered on lower polaroid, bottom left, tight spacing */
export const I_LOVE_YOU_LETTERS: LetterPlacement[] = [
  { char: 'i', left: '22%', top: '68%', rotate: -2 },
  { char: 'l', left: '27%', top: '68%', rotate: 1 },
  { char: 'o', left: '32%', top: '69%', rotate: -1 },
  { char: 'v', left: '37%', top: '68%', rotate: 2 },
  { char: 'e', left: '42%', top: '69%', rotate: -1 },
  { char: 'y', left: '24%', top: '78%', rotate: 2 },
  { char: 'o', left: '29%', top: '79%', rotate: -2 },
  { char: 'u', left: '34%', top: '78%', rotate: 1 },
]
