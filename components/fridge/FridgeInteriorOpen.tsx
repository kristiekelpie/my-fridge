'use client'

import { Location } from '@/lib/types'

interface BodyZone {
  id: Location
  label: string
  y: number
  height: number
}

const CAB_X = 14
const CAB_W = 185
const GAP = 16
const DOOR_X = CAB_X + CAB_W + GAP
const DOOR_W = 185
const TOP = 14
const HEIGHT = 492

const BODY_ZONES: BodyZone[] = [
  { id: 'shelf1', label: '1st Shelf', y: 232, height: 46 },
  { id: 'shelf2', label: '2nd Shelf', y: 280, height: 46 },
  { id: 'upper_drawer', label: 'Upper Drawer', y: 328, height: 40 },
  { id: 'shelf3', label: '3rd Shelf', y: 370, height: 46 },
  { id: 'lower_drawer', label: 'Lower Drawer', y: 418, height: 44 },
]

interface Props {
  itemCounts: Partial<Record<Location, number>>
  onZoneClick: (zone: Location) => void
  activeZone?: Location | null
  className?: string
}

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

export default function FridgeInteriorOpen({ itemCounts, onZoneClick, activeZone, className = '' }: Props) {
  const freezerCount = itemCounts['freezer'] ?? 0
  const doorCount = itemCounts['door'] ?? 0
  const isFreezerActive = activeZone === 'freezer'
  const isDoorActive = activeZone === 'door'

  const cabInnerX = CAB_X + 4
  const cabInnerW = CAB_W - 8
  const doorInnerX = DOOR_X + 8
  const doorInnerW = DOOR_W - 16

  return (
    <div
      className={`mx-auto ${className}`}
      style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.1))' }}
    >
      <svg
        viewBox="0 0 420 520"
        className="h-full w-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect x="0" y="0" width="420" height="520" fill="transparent" />

        {/* ── Main cabinet block ── */}
        <g>
          <rect x={CAB_X} y={TOP} width={CAB_W} height={HEIGHT} rx="12" fill="#FFFFFF" stroke="#A8A8A8" strokeWidth="1.5" />
          <rect x={CAB_X + 2} y={TOP + 2} width={CAB_W - 4} height={HEIGHT - 4} rx="11" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="0.5" />

          {/* Freezer interior */}
          <g onClick={() => onZoneClick('freezer')} style={{ cursor: 'pointer' }}>
            <rect
              x={cabInnerX}
              y={TOP + 4}
              width={cabInnerW}
              height={168}
              rx="8"
              fill={isFreezerActive ? '#E8F4FC' : '#F5FAFF'}
              stroke={isFreezerActive ? '#1A1A1A' : '#B8D4E8'}
              strokeWidth={isFreezerActive ? 2 : 1}
            />
            {[58, 112, 148].map((y) => (
              <line key={y} x1={cabInnerX + 4} y1={y} x2={cabInnerX + cabInnerW - 4} y2={y} stroke="#C8DFF0" strokeWidth="1" />
            ))}
            <text x={CAB_X + CAB_W / 2} y={TOP + 86} fontSize="9" fill="#6B8FA3" fontFamily="var(--font-mono), monospace" textAnchor="middle" letterSpacing="2">
              FREEZER
            </text>
            <CountBadge cx={CAB_X + CAB_W - 16} cy={TOP + 18} count={freezerCount} active={isFreezerActive} />
          </g>

          <line x1={cabInnerX} y1={TOP + 178} x2={cabInnerX + cabInnerW} y2={TOP + 178} stroke="#D4D4D4" strokeWidth="1.5" />

          <rect x={cabInnerX} y={TOP + 182} width={cabInnerW} height={286} rx="6" fill="#FAFAFA" stroke="#E8E8E8" strokeWidth="0.5" />

          {BODY_ZONES.map((zone) => {
            const count = itemCounts[zone.id] ?? 0
            const isActive = activeZone === zone.id
            const isDrawer = zone.id === 'upper_drawer' || zone.id === 'lower_drawer'
            return (
              <g key={zone.id} onClick={() => onZoneClick(zone.id)} style={{ cursor: 'pointer' }}>
                <rect
                  x={cabInnerX + 4}
                  y={zone.y}
                  width={cabInnerW - 8}
                  height={zone.height - 4}
                  rx={isDrawer ? 4 : 2}
                  fill={isActive ? '#F0EBDC' : isDrawer ? '#F8F8F6' : '#FFFFFF'}
                  stroke={isActive ? '#1A1A1A' : '#D4D4D4'}
                  strokeWidth={isActive ? 1.8 : 0.8}
                />
                {!isDrawer && (
                  <line x1={cabInnerX + 6} y1={zone.y + 2} x2={cabInnerX + cabInnerW - 6} y2={zone.y + 2} stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
                )}
                {isDrawer && (
                  <rect x={CAB_X + CAB_W / 2 - 15} y={zone.y + (zone.height - 4) / 2 - 1.5} width="30" height="3" rx="1.5" fill="#C8C8C8" />
                )}
                <text
                  x={cabInnerX + 12}
                  y={zone.y + (zone.height - 4) / 2 + 1}
                  fontSize="8"
                  fill="#5A5A5A"
                  fontFamily="var(--font-mono), monospace"
                  dominantBaseline="middle"
                  letterSpacing="0.5"
                >
                  {zone.label.toUpperCase()}
                </text>
                <CountBadge cx={cabInnerX + cabInnerW - 12} cy={zone.y + (zone.height - 4) / 2} count={count} active={isActive} />
              </g>
            )
          })}

          {/* Cabinet kickplate */}
          <rect x={CAB_X + 4} y={TOP + HEIGHT - 28} width={CAB_W - 8} height={22} rx="3" fill="#E8E8E8" />
          <line x1={CAB_X + 16} y1={TOP + HEIGHT - 20} x2={CAB_X + CAB_W - 16} y2={TOP + HEIGHT - 20} stroke="#D0D0D0" strokeWidth="0.5" />
        </g>

        {/* ── Door block (swung open, same size as cabinet) ── */}
        <g onClick={() => onZoneClick('door')} style={{ cursor: 'pointer' }}>
          <rect
            x={DOOR_X}
            y={TOP}
            width={DOOR_W}
            height={HEIGHT}
            rx="12"
            fill={isDoorActive ? '#F5F2EA' : '#FCFCFC'}
            stroke={isDoorActive ? '#1A1A1A' : '#A8A8A8'}
            strokeWidth={isDoorActive ? 2 : 1.5}
          />
          {/* Outer face shine */}
          <rect x={DOOR_X + DOOR_W - 14} y={TOP + 8} width="6" height={HEIGHT - 16} rx="3" fill="#FFFFFF" opacity="0.5" />

          {/* Hinge edge (left side of door block) */}
          <line x1={DOOR_X + 2} y1={TOP + 20} x2={DOOR_X + 2} y2={TOP + HEIGHT - 20} stroke="#888" strokeWidth="3" strokeLinecap="round" />

          {/* Upper panel — door continues above fridge opening */}
          <rect x={DOOR_X + 8} y={TOP + 8} width={DOOR_W - 16} height={168} rx="6" fill={isDoorActive ? '#FAFAF8' : '#FFFFFF'} stroke="#E8E8E8" strokeWidth="0.8" />

          {/* Door interior — fridge section */}
          <rect
            x={DOOR_X + 8}
            y={TOP + 182}
            width={DOOR_W - 16}
            height={286}
            rx="6"
            fill={isDoorActive ? '#FAF8F2' : '#FFFFFF'}
            stroke="#D4D4D4"
            strokeWidth="0.8"
          />

          {/* Door bins */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={doorInnerX}
              y={TOP + 196 + i * 64}
              width={doorInnerW}
              height="54"
              rx="4"
              fill={isDoorActive ? '#F0EBDC' : '#FAFAFA'}
              stroke="#D4D4D4"
              strokeWidth="0.8"
            />
          ))}

          <text
            x={DOOR_X + DOOR_W / 2}
            y={TOP + HEIGHT - 36}
            fontSize="9"
            fill="#5A5A5A"
            fontFamily="var(--font-mono), monospace"
            textAnchor="middle"
            letterSpacing="2"
          >
            DOOR
          </text>
          <CountBadge cx={DOOR_X + DOOR_W - 16} cy={TOP + 196} count={doorCount} active={isDoorActive} />

          {/* Door kickplate */}
          <rect x={DOOR_X + 4} y={TOP + HEIGHT - 28} width={DOOR_W - 8} height={22} rx="3" fill="#E8E8E8" />
          <line x1={DOOR_X + 16} y1={TOP + HEIGHT - 20} x2={DOOR_X + DOOR_W - 16} y2={TOP + HEIGHT - 20} stroke="#D0D0D0" strokeWidth="0.5" />
        </g>

        {/* Floor shadow between blocks */}
        <ellipse cx={(CAB_X + CAB_W + DOOR_X) / 2} cy={TOP + HEIGHT + 4} rx="90" ry="4" fill="#000" opacity="0.06" />
      </svg>
    </div>
  )
}
