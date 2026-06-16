'use client'

import { Location } from '@/lib/types'

interface BodyZone {
  id: Location
  label: string
  row: number
  col: 'full'
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

const ZONE_GAP = 6
const ROW_COUNT = 4
const ROW_H = Math.floor((FRIDGE_H - ZONE_GAP * (ROW_COUNT - 1)) / ROW_COUNT)
const SPLIT_GAP = 6
const NOTCH_W_RATIO = 0.44
const NOTCH_H_RATIO = 0.48
const ZONE_RX = 6

const BODY_ZONES: BodyZone[] = [
  { id: 'shelf1', label: '1st shelf', row: 0, col: 'full' },
  { id: 'shelf3', label: '3rd shelf', row: 2, col: 'full' },
  { id: 'lower_drawer', label: 'lower drawer', row: 3, col: 'full' },
]

function rowY(row: number) {
  return FRIDGE_Y + row * (ROW_H + ZONE_GAP)
}

function lShapePath(
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  notchW: number,
  notchH: number,
  r: number = ZONE_RX,
) {
  const nx = boxX + notchW + SPLIT_GAP
  const ny = boxY + notchH + SPLIT_GAP
  const x0 = boxX
  const y0 = boxY
  const x1 = boxX + boxW
  const y1 = boxY + boxH
  const rt = Math.min(r, (x1 - nx) / 2, (y1 - ny) / 2, notchW / 3, notchH / 3, (nx - x0) / 2)

  // Sharp inner corner preserves the visible gap beside/below the notch (drawer / storage)
  return [
    `M ${nx + rt} ${y0}`,
    `H ${x1 - rt}`,
    `Q ${x1} ${y0} ${x1} ${y0 + rt}`,
    `V ${y1 - rt}`,
    `Q ${x1} ${y1} ${x1 - rt} ${y1}`,
    `H ${x0 + rt}`,
    `Q ${x0} ${y1} ${x0} ${y1 - rt}`,
    `V ${ny}`,
    `H ${nx}`,
    `V ${y0 + rt}`,
    `Q ${nx} ${y0} ${nx + rt} ${y0}`,
    'Z',
  ].join(' ')
}

function lShapeLabelCenter(boxX: number, boxY: number, boxW: number, boxH: number, notchH: number) {
  return {
    x: boxX + boxW / 2,
    y: boxY + notchH + SPLIT_GAP + (boxH - notchH - SPLIT_GAP) / 2,
  }
}

const DOOR_INNER_X = DOOR_X + 8
const DOOR_INNER_W = DOOR_W - 16
const DOOR_FRIDGE_Y = FRIDGE_Y
const DOOR_FRIDGE_H = FRIDGE_H

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

function ZoneLabel({ x, y, w, h, label, active }: { x: number; y: number; w: number; h: number; label: string; active: boolean }) {
  return (
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
      <ZoneLabel x={x} y={y} w={w} h={h} label={label} active={active} />
      <CountBadge cx={x + w - 14} cy={y + 14} count={count} active={active} />
    </g>
  )
}

function ClickZoneL({
  boxX, boxY, boxW, boxH, notchW, notchH,
  label, labelX, labelY, count, active, onClick, badgeX, badgeY,
  fillIdle = '#FFFFFF',
}: {
  boxX: number; boxY: number; boxW: number; boxH: number
  notchW: number; notchH: number
  label: string
  labelX: number
  labelY: number
  count: number
  active: boolean
  onClick: () => void
  badgeX: number
  badgeY: number
  fillIdle?: string
}) {
  const path = lShapePath(boxX, boxY, boxW, boxH, notchW, notchH)

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <path
        d={path}
        fill={active ? '#F5F0E4' : fillIdle}
        stroke={active ? '#1A1A1A' : '#D4D4D4'}
        strokeWidth={active ? 1.8 : 1}
        strokeLinejoin="round"
      />
      <text
        x={labelX}
        y={labelY + 1}
        fontSize="9"
        fill={active ? '#1A1A1A' : '#3A3A3A'}
        fontFamily="var(--font-mono), monospace"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="0.3"
      >
        {label}
      </text>
      <CountBadge cx={badgeX} cy={badgeY} count={count} active={active} />
    </g>
  )
}

function notchSize(boxW: number, boxH: number) {
  return {
    w: boxW * NOTCH_W_RATIO,
    h: boxH * NOTCH_H_RATIO,
  }
}

function NotchedZoneRow({
  zoneX, zoneW, y, h,
  notchLabel, lLabel,
  notchCount, lCount,
  notchActive, lActive,
  onNotch, onL,
  notchRefH,
  showNotchCount = true,
  notchFill = '#FFFFFF',
  lFill = '#FFFFFF',
}: {
  zoneX: number; zoneW: number; y: number; h: number
  notchLabel: string; lLabel: string
  notchCount: number; lCount: number
  notchActive: boolean; lActive: boolean
  onNotch: () => void; onL: () => void
  notchRefH?: number
  showNotchCount?: boolean
  notchFill?: string
  lFill?: string
}) {
  const { w: notchW, h: notchH } = notchSize(zoneW, notchRefH ?? h)
  const lLabelPos = lShapeLabelCenter(zoneX, y, zoneW, h, notchH)

  return (
    <>
      <ClickZoneL
        boxX={zoneX}
        boxY={y}
        boxW={zoneW}
        boxH={h}
        notchW={notchW}
        notchH={notchH}
        label={lLabel}
        labelX={lLabelPos.x}
        labelY={lLabelPos.y}
        count={lCount}
        active={lActive}
        onClick={onL}
        badgeX={zoneX + zoneW - 14}
        badgeY={y + 14}
        fillIdle={lFill}
      />
      <ClickZone
        x={zoneX}
        y={y}
        w={notchW}
        h={notchH}
        label={notchLabel}
        count={showNotchCount ? notchCount : 0}
        active={notchActive}
        onClick={onNotch}
        fillIdle={notchFill}
      />
    </>
  )
}

export default function FridgeInteriorOpen({ itemCounts, onZoneClick, activeZone, className = '' }: Props) {
  const freezerCount = itemCounts['freezer'] ?? 0
  const doorCount = itemCounts['door'] ?? 0
  const isFreezerActive = activeZone === 'freezer'
  const isDoorActive = activeZone === 'door'

  const cabInnerX = CAB_X + 4
  const cabInnerW = CAB_W - 8

  return (
    <div className={`relative mx-auto pb-4 ${className}`}>
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

        {/* ── Cabinet interior ── */}
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
            onClick={() => onZoneClick('freezer')}
            fillIdle="url(#freezerInterior)"
            strokeIdle="#D0DEE8"
          />

          <rect x={cabInnerX} y={FRIDGE_Y} width={cabInnerW} height={FRIDGE_H} rx="6" fill="url(#interiorWhite)" stroke="#E8E8E6" strokeWidth="0.5" />

          {BODY_ZONES.map((zone) => {
            const count = itemCounts[zone.id] ?? 0
            const isActive = activeZone === zone.id

            return (
              <ClickZone
                key={zone.id}
                x={cabInnerX}
                y={rowY(zone.row)}
                w={cabInnerW}
                h={ROW_H}
                label={zone.label}
                count={count}
                active={isActive}
                onClick={() => onZoneClick(zone.id)}
              />
            )
          })}

          <NotchedZoneRow
            zoneX={cabInnerX}
            zoneW={cabInnerW}
            y={rowY(1)}
            h={ROW_H}
            notchLabel="drawer"
            lLabel="2nd shelf"
            notchCount={itemCounts['upper_drawer'] ?? 0}
            lCount={itemCounts['shelf2'] ?? 0}
            notchActive={activeZone === 'upper_drawer'}
            lActive={activeZone === 'shelf2'}
            onNotch={() => onZoneClick('upper_drawer')}
            onL={() => onZoneClick('shelf2')}
          />

          <rect x={CAB_X + 4} y={KICKPLATE_Y} width={CAB_W - 8} height={22} rx="3" fill="#F0F0EE" />
          <line x1={CAB_X + 16} y1={KICKPLATE_Y + 8} x2={CAB_X + CAB_W - 16} y2={KICKPLATE_Y + 8} stroke="#E0E0DE" strokeWidth="0.5" />
        </g>

        {/* ── Door ── */}
        <g>
          <rect
            x={DOOR_X}
            y={TOP}
            width={DOOR_W}
            height={HEIGHT}
            rx="12"
            fill="#FAFAF8"
            stroke="#B8B8B6"
            strokeWidth="1.2"
          />
          <line x1={DOOR_X + 2} y1={TOP + 20} x2={DOOR_X + 2} y2={TOP + HEIGHT - 20} stroke="#888" strokeWidth="3" strokeLinecap="round" />

          {/* Freezer door — opens freezer compartment */}
          <ClickZone
            x={DOOR_INNER_X}
            y={FREEZER_Y}
            w={DOOR_INNER_W}
            h={FREEZER_H}
            label="freezer door"
            count={freezerCount}
            active={isFreezerActive}
            onClick={() => onZoneClick('freezer')}
            fillIdle="url(#freezerInterior)"
            strokeIdle="#D0DEE8"
          />

          {/* Fridge door — single zone (storage + door combined) */}
          <ClickZone
            x={DOOR_INNER_X}
            y={DOOR_FRIDGE_Y}
            w={DOOR_INNER_W}
            h={DOOR_FRIDGE_H}
            label="fridge door"
            count={doorCount}
            active={isDoorActive}
            onClick={() => onZoneClick('door')}
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
