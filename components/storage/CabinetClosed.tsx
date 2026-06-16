'use client'

import type { StorageArea } from '@/lib/types'

interface Props {
  area: Exclude<StorageArea, 'fridge'>
  className?: string
}

/** White shaker door — round knob on the left */
function PantrySvg() {
  return (
    <svg viewBox="0 0 180 400" className="h-full w-auto max-w-[96vw] mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Wall trim */}
      <rect x="14" y="8" width="152" height="384" rx="2" fill="#F5F5F4" stroke="#D6D3D1" strokeWidth="1" />
      {/* Door slab */}
      <rect x="22" y="16" width="136" height="368" rx="1" fill="#FDFDFC" stroke="#E7E5E4" strokeWidth="1.2" />
      {/* Top recessed panel */}
      <rect x="34" y="32" width="112" height="228" rx="1" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.2" />
      <rect x="40" y="38" width="100" height="216" rx="1" fill="#F7F7F6" stroke="#E7E5E4" strokeWidth="0.6" />
      {/* Bottom recessed panel */}
      <rect x="34" y="276" width="112" height="92" rx="1" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.2" />
      <rect x="40" y="282" width="100" height="80" rx="1" fill="#F7F7F6" stroke="#E7E5E4" strokeWidth="0.6" />
      {/* Rail between panels */}
      <rect x="34" y="268" width="112" height="6" fill="#FDFDFC" />
      {/* Round knob — left side */}
      <circle cx="48" cy="210" r="7" fill="#E7E5E4" stroke="#A8A29E" strokeWidth="1" />
      <circle cx="48" cy="210" r="4.5" fill="#D6D3D1" />
      <ellipse cx="90" cy="392" rx="68" ry="6" fill="#000" opacity="0.1" />
    </svg>
  )
}

/** Light wood double-door wall cabinet — recessed panels */
function CupboardSvg() {
  return (
    <svg viewBox="0 0 280 268" className="h-full w-auto max-w-[96vw] mx-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="woodGrain" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#E8D4B8" />
          <stop offset="100%" stopColor="#D4BC98" />
        </linearGradient>
      </defs>
      {/* Cabinet box */}
      <rect x="16" y="12" width="248" height="244" rx="4" fill="url(#woodGrain)" stroke="#B89B72" strokeWidth="1.2" />
      {/* Centre stile */}
      <line x1="140" y1="16" x2="140" y2="252" stroke="#C4A882" strokeWidth="1.2" />
      {/* Left door */}
      <rect x="22" y="18" width="112" height="232" rx="2" fill="#EEDFC8" stroke="#C4A882" strokeWidth="0.8" />
      <rect x="32" y="28" width="92" height="212" rx="2" fill="#F2E6D4" stroke="#B89B72" strokeWidth="1" />
      <rect x="38" y="34" width="80" height="200" rx="1" fill="#EAD9C0" stroke="#C9AD86" strokeWidth="0.6" />
      {/* Right door */}
      <rect x="146" y="18" width="112" height="232" rx="2" fill="#EEDFC8" stroke="#C4A882" strokeWidth="0.8" />
      <rect x="156" y="28" width="92" height="212" rx="2" fill="#F2E6D4" stroke="#B89B72" strokeWidth="1" />
      <rect x="162" y="34" width="80" height="200" rx="1" fill="#EAD9C0" stroke="#C9AD86" strokeWidth="0.6" />
      {/* Subtle grain lines */}
      <line x1="28" y1="60" x2="118" y2="60" stroke="#D4BC98" strokeWidth="0.4" opacity="0.5" />
      <line x1="152" y1="80" x2="242" y2="80" stroke="#D4BC98" strokeWidth="0.4" opacity="0.5" />
      <ellipse cx="140" cy="262" rx="100" ry="5" fill="#000" opacity="0.12" />
    </svg>
  )
}

/** Wine fridge — front view, 7×4 = 28 round bottles */
function WineFridgeSvg() {
  const shelfYs = [56, 88, 120, 152, 184, 216, 248]
  const bottleXs = [44, 74, 104, 134]
  const bottleR = 7

  return (
    <svg viewBox="0 0 190 302" className="h-full w-auto max-w-[96vw] mx-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wineGlassFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3538" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1A1819" stopOpacity="0.32" />
        </linearGradient>
        <radialGradient id="wineBottleRound" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#5A3545" />
          <stop offset="100%" stopColor="#2A1520" />
        </radialGradient>
      </defs>
      {/* Outer frame */}
      <rect x="8" y="6" width="174" height="288" rx="6" fill="#1A1819" stroke="#0F0E0F" strokeWidth="1.2" />
      {/* Glass door */}
      <rect x="14" y="12" width="162" height="276" rx="4" fill="url(#wineGlassFront)" stroke="#3D3840" strokeWidth="0.8" />
      {/* Interior */}
      <rect x="20" y="18" width="150" height="264" rx="2" fill="#252225" />
      {/* Display strip */}
      <rect x="26" y="24" width="138" height="26" rx="2" fill="#111" />
      <rect x="72" y="29" width="46" height="16" rx="1" fill="#0A1628" stroke="#1E3A5F" strokeWidth="0.5" />
      <text x="95" y="41" textAnchor="middle" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
        12°
      </text>
      {/* Wire shelves + round bottle bases (28 total) */}
      {shelfYs.map(y => (
        <g key={y}>
          <line x1="28" y1={y} x2="162" y2={y} stroke="#8A858C" strokeWidth="1" opacity="0.75" />
          {bottleXs.map(x => (
            <g key={x}>
              <circle cx={x} cy={y + bottleR + 2} r={bottleR} fill="url(#wineBottleRound)" stroke="#5C3040" strokeWidth="0.6" />
              <circle cx={x - 1.8} cy={y + bottleR - 0.5} r={2.2} fill="#6A4555" opacity="0.35" />
              <circle cx={x} cy={y + bottleR + 2} r={3.8} fill="#1A0E14" opacity="0.45" />
            </g>
          ))}
        </g>
      ))}
      {/* Door reflection */}
      <rect x="118" y="20" width="28" height="250" rx="2" fill="#FFFFFF" opacity="0.04" transform="skewX(-8)" />
      {/* Handle */}
      <rect x="168" y="118" width="5" height="52" rx="2" fill="#4A4450" />
      <ellipse cx="95" cy="298" rx="72" ry="5" fill="#000" opacity="0.16" />
    </svg>
  )
}

export default function CabinetClosed({ area, className = '' }: Props) {
  return (
    <div className={`relative mx-auto block w-fit max-w-full pb-4 ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-[50%] bg-stone-900/30 blur-[18px]"
        style={{ bottom: '-0.15rem', width: '82%', height: '1.35rem' }}
      />
      <div className="relative z-[1] h-full w-full flex items-end justify-center">
        {area === 'pantry' && <PantrySvg />}
        {area === 'cupboard' && <CupboardSvg />}
        {area === 'wine_fridge' && <WineFridgeSvg />}
      </div>
    </div>
  )
}
