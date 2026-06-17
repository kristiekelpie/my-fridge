'use client'

export type FridgeSection = 'freezer' | 'fridge'

interface Props {
  freezerCount: number
  fridgeCount: number
  onSectionClick: (section: FridgeSection) => void
  activeSection?: FridgeSection | null
  className?: string
}

const CAB_X = 14
const CAB_W = 185
const GAP = 16
const DOOR_X = CAB_X + CAB_W + GAP
const DOOR_W = 185
const TOP = 14
const HEIGHT = 492

const FREEZER_Y = TOP + 4
const FREEZER_H = 168
const FRIDGE_Y = FREEZER_Y + FREEZER_H + 4
const KICKPLATE_Y = TOP + HEIGHT - 28
const FRIDGE_H = KICKPLATE_Y - FRIDGE_Y
const ZONE_RX = 6

const DOOR_INNER_X = DOOR_X + 8
const DOOR_INNER_W = DOOR_W - 16

function CountBadge({ cx, cy, count, active }: { cx: number; cy: number; count: number; active: boolean }) {
  if (count <= 0) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r="10" fill={active ? '#1A1A1A' : '#3A3A3A'} />
      <text x={cx} y={cy + 1} fontSize="10" fill="white" fontFamily="var(--font-mono), monospace" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
        {count}
      </text>
    </g>
  )
}

function ClickZone({
  x, y, w, h, label, count, active, onClick, fillIdle = '#FFFFFF', strokeIdle = '#D4D4D4',
}: {
  x: number; y: number; w: number; h: number
  label: string; count: number; active: boolean
  onClick: () => void
  fillIdle?: string
  strokeIdle?: string
}) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={ZONE_RX}
        fill={active ? '#F5F0E4' : fillIdle}
        stroke={active ? '#1A1A1A' : strokeIdle}
        strokeWidth={active ? 1.8 : 1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 1}
        fontSize="9"
        fill={active ? '#1A1A1A' : '#3A3A3A'}
        fontFamily="var(--font-mono), monospace"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="0.3"
      >
        {label}
      </text>
      <CountBadge cx={x + w - 14} cy={y + 14} count={count} active={active} />
    </g>
  )
}

export default function FridgeInteriorOpen({
  freezerCount,
  fridgeCount,
  onSectionClick,
  activeSection,
  className = '',
}: Props) {
  const cabInnerX = CAB_X + 4
  const cabInnerW = CAB_W - 8
  const isFreezerActive = activeSection === 'freezer'
  const isFridgeActive = activeSection === 'fridge'

  return (
    <div className={`relative mx-auto pb-1 ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-[50%] bg-stone-900/30 blur-[18px]"
        style={{ bottom: '-0.15rem', width: '82%', height: '1.35rem' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-[50%] bg-stone-900/15 blur-[8px]"
        style={{ bottom: '0.1rem', width: '68%', height: '0.55rem' }}
      />
      <div className="relative z-[1] h-full w-full">
        <svg
          viewBox="0 0 420 520"
          className="h-full w-full max-h-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="interiorWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F6F6F4" />
            </linearGradient>
            <linearGradient id="freezerInterior" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAFCFE" />
              <stop offset="100%" stopColor="#EEF4F8" />
            </linearGradient>
          </defs>

          {/* Cabinet interior */}
          <g>
            <rect x={CAB_X} y={TOP} width={CAB_W} height={HEIGHT} rx="12" fill="#FFFFFF" stroke="#B8B8B6" strokeWidth="1.2" />
            <rect x={CAB_X + 2} y={TOP + 2} width={CAB_W - 4} height={HEIGHT - 4} rx="11" fill="url(#interiorWhite)" />

            <ClickZone
              x={cabInnerX}
              y={FREEZER_Y}
              w={cabInnerW}
              h={FREEZER_H}
              label="freezer"
              count={freezerCount}
              active={isFreezerActive}
              onClick={() => onSectionClick('freezer')}
              fillIdle="url(#freezerInterior)"
              strokeIdle="#D0DEE8"
            />

            <ClickZone
              x={cabInnerX}
              y={FRIDGE_Y}
              w={cabInnerW}
              h={FRIDGE_H}
              label="fridge"
              count={fridgeCount}
              active={isFridgeActive}
              onClick={() => onSectionClick('fridge')}
              fillIdle="url(#interiorWhite)"
            />

            <rect x={CAB_X + 4} y={KICKPLATE_Y} width={CAB_W - 8} height={22} rx="3" fill="#F0F0EE" />
            <line x1={CAB_X + 16} y1={KICKPLATE_Y + 8} x2={CAB_X + CAB_W - 16} y2={KICKPLATE_Y + 8} stroke="#E0E0DE" strokeWidth="0.5" />
          </g>

          {/* Door */}
          <g>
            <rect x={DOOR_X} y={TOP} width={DOOR_W} height={HEIGHT} rx="12" fill="#FAFAF8" stroke="#B8B8B6" strokeWidth="1.2" />
            <line x1={DOOR_X + 2} y1={TOP + 20} x2={DOOR_X + 2} y2={TOP + HEIGHT - 20} stroke="#888" strokeWidth="3" strokeLinecap="round" />

            <ClickZone
              x={DOOR_INNER_X}
              y={FREEZER_Y}
              w={DOOR_INNER_W}
              h={FREEZER_H}
              label="freezer door"
              count={freezerCount}
              active={isFreezerActive}
              onClick={() => onSectionClick('freezer')}
              fillIdle="url(#freezerInterior)"
              strokeIdle="#D0DEE8"
            />

            <ClickZone
              x={DOOR_INNER_X}
              y={FRIDGE_Y}
              w={DOOR_INNER_W}
              h={FRIDGE_H}
              label="fridge door"
              count={fridgeCount}
              active={isFridgeActive}
              onClick={() => onSectionClick('fridge')}
              fillIdle="url(#interiorWhite)"
            />

            <rect x={DOOR_X + 4} y={KICKPLATE_Y} width={DOOR_W - 8} height={22} rx="3" fill="#F0F0EE" />
            <line x1={DOOR_X + 16} y1={KICKPLATE_Y + 8} x2={DOOR_X + DOOR_W - 16} y2={KICKPLATE_Y + 8} stroke="#E0E0DE" strokeWidth="0.5" />
          </g>

          <ellipse cx={(CAB_X + CAB_W + DOOR_X) / 2} cy={TOP + HEIGHT + 4} rx="90" ry="4" fill="#000" opacity="0.06" />
          <ellipse cx={(CAB_X + CAB_W + DOOR_X) / 2} cy={TOP + HEIGHT + 8} rx="102" ry="7" fill="#000" opacity="0.14" />
        </svg>
      </div>
    </div>
  )
}
